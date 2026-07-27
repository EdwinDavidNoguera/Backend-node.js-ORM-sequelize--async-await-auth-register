import Paciente from "../models/pacienteModel.js";
import UsuarioService from "./usuarioService.js";
import sequelize from "../models/db.js";
import AppError from "../utils/errors/appError.js";

class PacienteService {
  /**
   * ==========================================
   * VALIDACIÓN CENTRALIZADA Y ACUMULATIVA
   * ==========================================
   */
  static validarFormularioPaciente(datos, opciones = {}) {
    const { requierePassword = false, esActualizacion = false } = opciones;
    const { nombre, apellido, celular, email, password, fecha_nacimiento } =
      datos;
    const errores = {};

    // 1. Validaciones de presencia (Solo si no es una actualización parcial)
    if (!esActualizacion) {
      if (!nombre || nombre.trim() === "")
        errores.nombre = "El nombre es obligatorio";
      if (!apellido || apellido.trim() === "")
        errores.apellido = "El apellido es obligatorio";
      if (!celular || celular.trim() === "")
        errores.celular = "El celular es obligatorio";
      if (!email || email.trim() === "")
        errores.email = "El correo es obligatorio";
    }

    // 2. Validación de formato de Email
    if (email && email.trim() !== "") {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(email.trim())) {
        errores.email = "El correo electrónico no es válido";
      }
    }

    // 3. Validación de Celular (Atrapado antes de que toque la Base de Datos)
    if (celular && celular.trim() !== "") {
      const celularLimpio = celular.trim();
      if (celularLimpio.length !== 10) {
        errores.celular = "El celular debe tener exactamente 10 dígitos";
      } else if (!/^\d+$/.test(celularLimpio)) {
        errores.celular = "El celular solo debe contener números";
      }
    }

    // 4. Validación de Contraseña (Fuerte)
    if (requierePassword && !password) {
      errores.password = "La contraseña es obligatoria para crear una cuenta";
    } else if (password) {
      const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!regexPassword.test(password)) {
        errores.password =
          "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";
      }
    }

    // 5. Validación de Fecha de Nacimiento
    if (fecha_nacimiento) {
      const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
      if (!regexFecha.test(fecha_nacimiento)) {
        errores.fecha_nacimiento =
          "El formato de fecha de nacimiento debe ser YYYY-MM-DD";
      } else {
        const fecha = new Date(fecha_nacimiento);
        if (isNaN(fecha.getTime())) {
          errores.fecha_nacimiento = "La fecha de nacimiento no es válida";
        }
      }
    }

    // 🔥 Si el objeto acumuló llaves, disparamos todos los errores al mismo tiempo
    if (Object.keys(errores).length > 0) {
      throw new AppError("Error de validación en el formulario", 400, errores);
    }
  }

  /**
   * ==========================================
   * FLUJO 1: REGISTRO COMPLETO (CON USUARIO)
   * ==========================================
   */
  static async registrarPacienteConUsuario(datos) {
    const {
      nombre,
      apellido,
      cedula,
      celular,
      genero,
      fecha_nacimiento,
      direccion,
      email,
      password,
      avatar,
    } = datos;

    // 1. Ejecutamos la validación integral masiva
    this.validarFormularioPaciente(datos, { requierePassword: true });

    // 2. Iniciamos la transacción de forma segura
    const transaction = await sequelize.transaction();

    try {
      const cedulaLimpia = cedula?.trim();

      if (cedulaLimpia) {
        const cedulaExistente = await Paciente.findOne({
          where: { cedula: cedulaLimpia },
          transaction,
        });

        if (cedulaExistente) {
          throw new AppError("La cédula ya está registrada", 409, {
            cedula: "La cédula ya está registrada",
          });
        }
      }

      // Crear Usuario heredando la transacción
      const nuevoUsuario = await UsuarioService.crearUsuario(
        {
          email: email.trim(),
          password,
          rol: "PACIENTE",
          avatar: avatar || "default-avatar.png",
        },
        { transaction },
      );

      const usuarioSinPassword = nuevoUsuario.toJSON();
      delete usuarioSinPassword.password;

      // Crear Paciente heredando la transacción
      const nuevoPaciente = await Paciente.create(
        {
          id_usuario: nuevoUsuario.id,
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          cedula: cedulaLimpia || null,
          celular: celular.trim(),
          genero,
          fecha_nacimiento,
          direccion: direccion || null,
          email: email.trim(),
        },
        { transaction },
      );

      await transaction.commit();
      return { usuario: usuarioSinPassword, paciente: nuevoPaciente };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * ==========================================
   * FLUJO 2: VISITANTE (SIN USUARIO / SOLO HOME)
   * ==========================================
   */
  static async procesarVisitante(datos) {
    const { nombre, apellido, celular, genero, email } = datos;

    // Validación masiva de formatos y vacíos
    this.validarFormularioPaciente(datos);

    // 1. Buscar por email
    let pacienteExistente = await Paciente.findOne({
      where: { email: email.trim() },
    });

    // 2. Si no está, buscar por celular
    if (!pacienteExistente) {
      pacienteExistente = await Paciente.findOne({
        where: { celular: celular.trim() },
      });
    }

    // 3. Si se encontró por cualquiera de las dos vías
    if (pacienteExistente) {
      if (pacienteExistente.id_usuario !== null) {
        // 🎯 DETECTAR CUÁL FUE EL CAMPO DUPLICADO REAL
        const esConflictoEmail = pacienteExistente.email === email.trim();
        const campoCulpable = esConflictoEmail ? "email" : "celular";
        const mensajeDetallado = esConflictoEmail
          ? "Este correo ya está en uso por un usuario registrado"
          : "Este número celular ya está en uso por un usuario registrado";

        throw new AppError(
          "Este correo/celular pertenece a una cuenta registrada. Por favor, inicia sesión para agendar.",
          409,
          { [campoCulpable]: mensajeDetallado }, // 🌟 Corregido: campoCulpable
        );
      }

      // Si existía como visitante previo (id_usuario === null), se actualizan sus datos
      return await pacienteExistente.update({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        celular: celular.trim(),
        genero,
      });
    }

    // Si es completamente nuevo, se crea
    return await Paciente.create({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      celular: celular.trim(),
      email: email.trim(),
      genero,
      id_usuario: null,
    });
  }
  /**
   * ==========================================
   * OBTENER TODOS / POR ID
   * ==========================================
   */
  static async obtenerPacientes() {
    return await Paciente.findAll({
      // include: [
      //   {
      //     association: "usuario",
      //     attributes: { exclude: ["password"] },
      //   },
      // ],
    });
  }

  static async obtenerPacientePorId(id) {
    const paciente = await Paciente.findByPk(id, {
      // include: ["usuario"],
    });

    if (!paciente) throw new AppError("Paciente no encontrado", 404);
    return paciente;
  }

  /**
   * ==========================================
   * ACTUALIZAR PACIENTE
   * ==========================================
   */
  static async actualizarPaciente(id, datos) {
    const transaction = await sequelize.transaction();

    try {
      const paciente = await Paciente.findByPk(id, { transaction });
      if (!paciente) throw new AppError("Paciente no encontrado", 404);

      // Validación acumulativa para campos enviados en la actualización
      this.validarFormularioPaciente(datos, { esActualizacion: true });

      await paciente.update(
        {
          nombre: datos.nombre ?? paciente.nombre,
          apellido: datos.apellido ?? paciente.apellido,
          celular: datos.celular ?? paciente.celular,
          cedula: datos.cedula ?? paciente.cedula,
          direccion: datos.direccion ?? paciente.direccion,
          genero: datos.genero ?? paciente.genero,
          fecha_nacimiento: datos.fecha_nacimiento ?? paciente.fecha_nacimiento,
          email: datos.email ?? paciente.email,
        },
        { transaction },
      );

      await transaction.commit();
      return { paciente };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * ==========================================
   * ELIMINAR PACIENTE
   * ==========================================
   */
  static async eliminarPaciente(id, force = false) {
    const transaction = await sequelize.transaction();

    try {
      const paciente = await Paciente.findByPk(id, { transaction });
      if (!paciente) throw new AppError("Paciente no encontrado", 404);

      const totalCitas = await paciente.countCitas({ transaction });

      if (totalCitas > 0 && !force) {
        await transaction.rollback();

        return {
          requiereConfirmacion: true,
          totalCitas,
          message: `El paciente tiene ${totalCitas} citas asociadas en su historial. ¿Deseas eliminarlo de todos modos?`,
        };
      }

      await paciente.destroy({ transaction });

      if (paciente.id_usuario) {
        await UsuarioService.eliminarUsuario(paciente.id_usuario, {
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

export default PacienteService;
