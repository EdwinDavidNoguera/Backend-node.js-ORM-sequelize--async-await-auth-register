import Odontologo from "../models/odontologoModel.js";
import UsuarioService from "./usuarioService.js";
import sequelize from "../models/db.js";
import AppError from "../utils/errors/appError.js";

class OdontologoService {
  /**
   * ==========================================
   * VALIDACIÓN CENTRALIZADA Y ACUMULATIVA
   * ==========================================
   */
  static validarFormularioOdontologo(datos, opciones = {}) {
    const { requierePassword = false, esActualizacion = false } = opciones;
    const { nombre, apellido, cedula, celular, email, password } = datos;
    const errores = {};

    // 1. Validaciones de presencia (Solo si no es una actualización parcial)
    if (!esActualizacion) {
      if (!nombre || nombre.trim() === "") errores.nombre = "El nombre es obligatorio";
      if (!apellido || apellido.trim() === "") errores.apellido = "El apellido es obligatorio";
      if (!cedula || cedula.trim() === "") errores.cedula = "La cédula es obligatoria";
      if (!celular || celular.trim() === "") errores.celular = "El número celular es obligatorio";
      if (!email || email.trim() === "") errores.email = "El correo electrónico es obligatorio";
    }

    // 2. Validación de formato de Email
    if (email && email.trim() !== "") {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(email.trim())) {
        errores.email = "El correo electrónico no es válido";
      }
    }

    // 3. Validación de Celular (Atrapado antes de romper la Base de Datos)
    if (celular && celular.trim() !== "") {
      const celularLimpio = celular.trim();
      if (celularLimpio.length !== 10) {
        errores.celular = "El celular debe tener exactamente 10 dígitos";
      } else if (!/^\d+$/.test(celularLimpio)) {
        errores.celular = "El celular solo debe contener números";
      }
    }

    // 4. Validación de Contraseña Fuerte
    if (requierePassword && !password) {
      errores.password = "La contraseña es obligatoria para la cuenta del odontólogo";
    } else if (password) {
      const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!regexPassword.test(password)) {
        errores.password = "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";
      }
    }

    // 🔥 Si el objeto acumuló errores, los enviamos todos juntos
    if (Object.keys(errores).length > 0) {
      throw new AppError("Error de validación en el formulario", 400, errores);
    }
  }

  /**
   * ==========================================
   * CREAR ODONTÓLOGO + USUARIO
   * ==========================================
   */
  static async crearOdontologo(datos) {
    const {
      nombre,
      apellido,
      cedula,
      celular,
      numero_licencia,
      id_consultorio,
      email,
      password,
      avatar,
    } = datos;

    // 1. Validar reglas de negocio acumulativas
    this.validarFormularioOdontologo(datos, { requierePassword: true });

    // 2. Iniciar transacción segura
    const transaction = await sequelize.transaction();

    try {
      // Validar duplicado de cédula antes de tocar la DB
      const cedulaExistente = await Odontologo.findOne({
        where: { cedula: cedula.trim() },
        transaction,
      });

      if (cedulaExistente) {
        throw new AppError("La cédula ya está registrada", 409, { cedula: "La cédula ya está registrada" });
      }

      // 3. Crear el usuario (Pasando correctamente las opciones de transacción en el 2do argumento)
      const nuevoUsuario = await UsuarioService.crearUsuario(
        {
          email: email.trim(),
          password,
          rol: "ODONTOLOGO",
          avatar: avatar || "default-avatar.png",
        },
        { transaction },
      );

      const usuarioSinPassword = nuevoUsuario.toJSON();
      delete usuarioSinPassword.password;

      // 4. Crear el registro del odontólogo apuntando a 'id_usuario'
      const nuevoOdontologo = await Odontologo.create(
        {
          id_usuario: nuevoUsuario.id,
          id_consultorio: id_consultorio || null,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          cedula: cedula.trim(),
          celular: celular.trim(),
          numero_licencia: numero_licencia || null,
        },
        { transaction },
      );

      // Si todo fue exitoso, consolidamos los datos de forma permanente
      await transaction.commit();

      return {
        usuario: usuarioSinPassword,
        odontologo: nuevoOdontologo,
      };
    } catch (error) {
      // Evitamos usuarios huérfanos ante cualquier fallo
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * ==========================================
   * OBTENER TODOS / POR ID
   * ==========================================
   */
  static async obtenerOdontologos() {
    return await Odontologo.findAll({
      include: [
        {
          association: "usuario",
          attributes: { exclude: ["password"] }
        }
      ],
    });
  }

  static async obtenerOdontologoPorId(id) {
    const odontologo = await Odontologo.findByPk(id, { 
      include: [
        {
          association: "usuario",
          attributes: { exclude: ["password"] }
        }
      ] 
    });
    
    if (!odontologo) throw new AppError("Odontólogo no encontrado", 404);
    return odontologo;
  }

  /**
   * ==========================================
   * ACTUALIZAR ODONTÓLOGO + USUARIO
   * ==========================================
   */
  static async actualizarOdontologo(id, datos) {
    const transaction = await sequelize.transaction();

    try {
      // Verificar existencia del odontólogo
      const odontologo = await Odontologo.findByPk(id, { transaction });
      if (!odontologo) throw new AppError("Odontólogo no encontrado", 404);

      // Validar masivamente los campos de actualización enviados
      this.validarFormularioOdontologo(datos, { esActualizacion: true });

      let usuarioActualizado = null;

      // 1. Si se intenta actualizar credenciales, llamamos al UsuarioService de forma correcta
      if (
        odontologo.id_usuario &&
        (datos.email || datos.password || datos.avatar || datos.activo)
      ) {
        usuarioActualizado = await UsuarioService.actualizarUsuario(
          odontologo.id_usuario,
          {
            email: datos.email,
            password: datos.password,
            avatar: datos.avatar,
            activo: datos.activo,
          },
          { transaction }, // Enrutado seguro dentro de las opciones
        );
      }

      // 2. Actualizar los campos propios de la tabla odontologo
      await odontologo.update(
        {
          nombre: datos.nombre ?? odontologo.nombre,
          apellido: datos.apellido ?? odontologo.apellido,
          cedula: datos.cedula ?? odontologo.cedula,
          celular: datos.celular ?? odontologo.celular,
          numero_licencia: datos.numero_licencia ?? odontologo.numero_licencia,
          id_consultorio: datos.id_consultorio ?? odontologo.id_consultorio,
        },
        { transaction },
      );

      await transaction.commit();
      return { usuario: usuarioActualizado, odontologo };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * ==========================================
   * ELIMINAR ODONTÓLOGO
   * ==========================================
   */
  static async eliminarOdontologo(id, force = false) {
    const transaction = await sequelize.transaction();

    try {
      const odontologo = await Odontologo.findByPk(id, { transaction });
      if (!odontologo) throw new AppError("Odontólogo no encontrado", 404);

      // Contar cuántas citas tiene asignadas este doctor
      const totalCitas = await odontologo.countCitas({ transaction });

      // Si tiene citas y no se ha forzado la eliminación
      if (totalCitas > 0 && !force) {
        await transaction.rollback();

        return {
          requiereConfirmacion: true,
          totalCitas,
          message: `El odontólogo tiene ${totalCitas} citas asignadas. ¿Deseas eliminarlo?`,
        };
      }

      // Procedemos a eliminar el perfil
      await odontologo.destroy({ transaction });

      // Eliminar credenciales de usuario asociadas pasándole el objeto de opciones
      if (odontologo.id_usuario) {
        await UsuarioService.eliminarUsuario(odontologo.id_usuario, {
          transaction,
        });
      }

      await transaction.commit();
      return { eliminado: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default OdontologoService;