import Usuario from "../models/usuarioModel.js";
import Paciente from "../models/pacienteModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import AppError from "../utils/errors/appError.js";
import { Op } from "sequelize";
import EmailService from "../utils/emailService.js"; // Servicio para enviar correos electrónicos.

class UsuarioService {

  /**
   * Valida los datos necesarios para crear un usuario.
   * Verifica que el correo y la contraseña estén presentes
   * y que cumplan con los requisitos establecidos.
   */
  static validarDatosCredenciales({ email, password }) {
    const errores = {};

    // Comprueba que los campos obligatorios tengan información.
    if (!email || email.trim() === "") {
      errores.email = "El correo es obligatorio";
    }

    if (!password) {
      errores.password = "La contraseña es obligatoria";
    }

    // Comprueba el formato del correo electrónico.
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !regexEmail.test(email.trim())) {
      errores.email = "El correo electrónico no es válido";
    }

    // Comprueba los requisitos de seguridad de la contraseña.
    const regexPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (password && !regexPassword.test(password)) {
      errores.password =
        "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";
    }

    // Devuelve todos los errores de validación en una sola respuesta.
    if (Object.keys(errores).length > 0) {
      throw new AppError(
        "Error de validación en las credenciales",
        400,
        errores
      );
    }
  }


  /**
   * Crea un nuevo usuario en el sistema.
   * Valida las credenciales, verifica que el correo no esté registrado
   * y cifra la contraseña antes de almacenarla.
   */
  static async crearUsuario(datos, options = {}) {
    const { email, password, rol, avatar } = datos;
    const { transaction } = options;

    // Valida los datos recibidos.
    this.validarDatosCredenciales({ email, password });

    // Comprueba que el correo no esté registrado.
    const usuarioExistente = await Usuario.findOne({
      where: { email: email.trim() },
      transaction
    });

    if (usuarioExistente) {
      // Identifica el campo que provoca el conflicto.
      throw new AppError(
        "El correo ya está registrado",
        409,
        { email: "El correo ya está registrado" }
      );
    }

    // Cifra la contraseña antes de guardarla en la base de datos.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea el nuevo usuario.
    const nuevoUsuario = await Usuario.create(
      {
        email: email.trim(),
        password: hashedPassword,
        rol,
        avatar: avatar || "default-avatar.png"
      },
      { transaction }
    );

    return nuevoUsuario;
  }


  /**
   * Solicita la recuperación de contraseña de un usuario.
   *
  * Este flujo:
   * 1. Busca el usuario mediante su correo.
   * 2. Genera un token aleatorio.
   * 3. Define una fecha de expiración para el token.
   * 4. Guarda ambos valores en la tabla usuario.
  * 5. Envía el token por correo electrónico.
   */
  static async solicitarRecuperacion(email) {

    // Busca el usuario mediante su correo electrónico.
    const usuario = await Usuario.findOne({
      where: { email: email.trim() }
    });

    // Comprueba que exista un usuario asociado al correo.
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    // Genera un token aleatorio y seguro mediante crypto.
    const token = crypto.randomBytes(20).toString("hex");

    // Establece una duración de dos horas para el token.
    const expiracion = new Date(
      Date.now() + 2 * 60 * 60 * 1000
    );

    // Guarda el token y su fecha de expiración en el usuario.
    await usuario.update({
      reset_password_token: token,
      reset_password_expires: expiracion
    });

    // Prepara el enlace de recuperación y envía el correo.
    
    // Construye el enlace que utilizará el cliente para restablecer la contraseña.
    const urlReact = `http://localhost:5173/restablecer-password/${token}`;
    
    await EmailService.enviarCorreoRecuperacion(usuario.email, urlReact);

    /*
      * El token no se devuelve al cliente por seguridad.
      * return {
     * token,
     * expiracion
     * };
     */
     
        // Indica que el proceso terminó correctamente.
    return true; 
  }


  /**
   * Busca un usuario mediante su identificador.
   * La contraseña se excluye de la información obtenida.
   */
  static async obtenerUsuarioPorId(id, options = {}) {
    const { transaction } = options;

    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [{
        model: Paciente,
        as: "paciente",
        attributes: [
          "id",
          "nombre",
          "apellido",
          "cedula",
          "celular",
          "genero",
          "fecha_nacimiento",
          "direccion",
          "email",
          "id_usuario"
        ]
      }],
      transaction
    });

    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return usuario;
  }


  /**
   * Obtiene todos los usuarios registrados en el sistema.
   * La contraseña no se incluye en los resultados.
   */
  static async obtenerUsuarios() {
    return await Usuario.findAll({
      attributes: { exclude: ["password"] },
      include: [{
        model: Paciente,
        as: "paciente",
        attributes: [
          "id",
          "nombre",
          "apellido",
          "cedula",
          "celular",
          "genero",
          "fecha_nacimiento",
          "direccion",
          "email",
          "id_usuario"
        ]
      }]
    });
  }


  /**
   * Actualiza la información de un usuario.
   * Permite modificar el correo, contraseña, avatar, estado y rol.
   * Las validaciones se acumulan para mostrar todos los errores encontrados.
   */
  static async actualizarUsuario(id, datos, options = {}) {
    const { transaction } = options;

    const usuario = await Usuario.findByPk(id, { transaction });

    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const { email, password, avatar, activo, rol } = datos;
    const errores = {};

    // Valida el nuevo correo y comprueba que no esté siendo utilizado.
    if (email && email.trim() !== usuario.email) {
      const emailLimpio = email.trim();
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!regexEmail.test(emailLimpio)) {
        errores.email = "El correo electrónico no es válido";
      } else {
        const emailExistente = await Usuario.findOne({
          where: { email: emailLimpio },
          transaction
        });

        if (emailExistente) {
          errores.email = "El correo ya está en uso";
        }
      }
    }

    // Validar y cifrar la nueva contraseña si fue proporcionada.
    let passwordHash;

    if (password) {
      const regexPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

      if (!regexPassword.test(password)) {
        errores.password =
          "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";
      } else {
        passwordHash = await bcrypt.hash(password, 10);
      }
    }

    // Si existen errores, se envían todos juntos.
    if (Object.keys(errores).length > 0) {
      throw new AppError(
        "Error de validación en la actualización",
        400,
        errores
      );
    }

    // Aplicar los cambios realizados al usuario.
    await usuario.update(
      {
        email: email ? email.trim() : usuario.email,
        password: passwordHash ?? usuario.password,
        avatar: avatar ?? usuario.avatar,
        activo: activo ?? usuario.activo,
        rol: rol ?? usuario.rol
      },
      { transaction }
    );

    // Eliminar la contraseña antes de devolver la información actualizada.
    const usuarioActualizado = usuario.toJSON();
    delete usuarioActualizado.password;

    return usuarioActualizado;
  }

  static async obtenerMiCuenta(usuarioId) {
    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: ["id", "email", "rol", "avatar"],
      include: [{
        model: Paciente,
        as: "paciente",
        attributes: [
          "id",
          "nombre",
          "apellido",
          "cedula",
          "celular",
          "genero",
          "fecha_nacimiento",
          "direccion",
          "email",
          "id_usuario",
        ],
      }],
    });

    if (!usuario || usuario.rol !== "PACIENTE" || !usuario.paciente) {
      throw new AppError("No se encontró un perfil de paciente asociado", 404);
    }

    return {
      usuario: {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
      },
      paciente: usuario.paciente,
    };
  }

  static async actualizarMiCuenta(usuarioId, datos) {
    datos = datos && typeof datos === "object" && !Array.isArray(datos) ? datos : {};
    const camposPaciente = [
      "nombre",
      "apellido",
      "cedula",
      "celular",
      "genero",
      "fecha_nacimiento",
      "direccion",
    ];
    const camposPermitidos = new Set([
      ...camposPaciente,
      "email",
      "currentPassword",
      "newPassword",
    ]);
    const camposDesconocidos = Object.keys(datos).filter(
      (campo) => !camposPermitidos.has(campo),
    );

    if (camposDesconocidos.length > 0) {
      throw new AppError("La solicitud contiene campos no permitidos", 400, {
        campos: camposDesconocidos,
      });
    }

    const actualizaEmail = Object.hasOwn(datos, "email");
    const actualizaPassword =
      Object.hasOwn(datos, "newPassword") && datos.newPassword !== "";
    const actualizaPaciente = camposPaciente.some((campo) =>
      Object.hasOwn(datos, campo),
    );

    if (!actualizaEmail && !actualizaPassword && !actualizaPaciente) {
      throw new AppError("No se recibieron datos para actualizar", 400);
    }

    const transaction = await Usuario.sequelize.transaction();

    try {
      const usuario = await Usuario.findByPk(usuarioId, { transaction });

      if (!usuario || usuario.rol !== "PACIENTE") {
        throw new AppError("Usuario paciente no encontrado", 404);
      }

      const paciente = await Paciente.findOne({
        where: { id_usuario: usuario.id },
        transaction,
      });

      if (!paciente) {
        throw new AppError("No se encontró un perfil de paciente asociado", 404);
      }

      const nuevoEmail = actualizaEmail
        ? typeof datos.email === "string"
          ? datos.email.trim()
          : ""
        : usuario.email;
      const emailCambia = nuevoEmail !== usuario.email;
      const contraseñaNueva = actualizaPassword ? datos.newPassword : null;

      if (actualizaEmail) {
        if (
          !nuevoEmail ||
          nuevoEmail.length > 100 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoEmail)
        ) {
          throw new AppError("El correo electrónico no es válido", 400, {
            email: "Ingresa un correo válido de máximo 100 caracteres",
          });
        }

        if (emailCambia) {
          const correoExistente = await Usuario.findOne({
            where: {
              email: nuevoEmail,
              id: { [Op.ne]: usuario.id },
            },
            transaction,
          });

          if (correoExistente) {
            throw new AppError("El correo ya está en uso", 409, {
              email: "El correo ya está en uso",
            });
          }
        }
      }

      let passwordHash;
      if (actualizaPassword) {
        if (typeof contraseñaNueva !== "string") {
          throw new AppError("La nueva contraseña no es válida", 400, {
            newPassword: "La nueva contraseña debe ser texto",
          });
        }

        const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!regexPassword.test(contraseñaNueva)) {
          throw new AppError("La nueva contraseña no cumple los requisitos", 400, {
            newPassword:
              "Debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.",
          });
        }
      }

      if (actualizaPassword) {
        if (typeof datos.currentPassword !== "string" || !datos.currentPassword) {
          throw new AppError("Debes confirmar tu contraseña actual", 400, {
            currentPassword: "La contraseña actual es obligatoria para cambiar credenciales",
          });
        }

        const passwordValida = await bcrypt.compare(
          datos.currentPassword,
          usuario.password,
        );
        if (!passwordValida) {
          throw new AppError("La contraseña actual es incorrecta", 401, {
            currentPassword: "Verifica tu contraseña actual",
          });
        }
      }

      if (actualizaPassword) {
        passwordHash = await bcrypt.hash(contraseñaNueva, 10);
      }

      const cambiosPaciente = {};
      for (const campo of camposPaciente) {
        if (!Object.hasOwn(datos, campo)) continue;

        const valor = datos[campo];
        const camposOpcionales = ["cedula", "fecha_nacimiento", "direccion"];
        if (valor === null && camposOpcionales.includes(campo)) {
          cambiosPaciente[campo] = null;
          continue;
        }

        if (typeof valor !== "string" || !valor.trim()) {
          throw new AppError("Hay datos personales inválidos", 400, {
            [campo]: "Este campo debe contener un valor válido",
          });
        }

        const limitesCampo = {
          nombre: 80,
          apellido: 80,
          cedula: 10,
          celular: 10,
          genero: 10,
          direccion: 150,
        };
        if (valor.trim().length > limitesCampo[campo]) {
          throw new AppError("Hay datos personales inválidos", 400, {
            [campo]: `El máximo permitido es ${limitesCampo[campo]} caracteres`,
          });
        }

        cambiosPaciente[campo] = valor.trim();
      }

      if (
        Object.hasOwn(cambiosPaciente, "celular") &&
        !/^\d{10}$/.test(cambiosPaciente.celular)
      ) {
        throw new AppError("El celular no es válido", 400, {
          celular: "Debe contener exactamente 10 dígitos",
        });
      }

      if (
        Object.hasOwn(cambiosPaciente, "cedula") &&
        cambiosPaciente.cedula !== null &&
        !/^\d{1,10}$/.test(cambiosPaciente.cedula)
      ) {
        throw new AppError("La cédula no es válida", 400, {
          cedula: "Debe contener máximo 10 dígitos",
        });
      }

      if (
        Object.hasOwn(cambiosPaciente, "genero") &&
        !["MASCULINO", "FEMENINO", "OTRO"].includes(cambiosPaciente.genero)
      ) {
        throw new AppError("El género no es válido", 400, {
          genero: "Selecciona una opción válida",
        });
      }

      if (
        Object.hasOwn(cambiosPaciente, "fecha_nacimiento") &&
        cambiosPaciente.fecha_nacimiento !== null
      ) {
        const fecha = cambiosPaciente.fecha_nacimiento;
        const fechaValida =
          /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
          !Number.isNaN(Date.parse(`${fecha}T00:00:00.000Z`)) &&
          new Date(`${fecha}T00:00:00.000Z`).toISOString().slice(0, 10) === fecha;
        if (!fechaValida) {
          throw new AppError("La fecha de nacimiento no es válida", 400, {
            fecha_nacimiento: "Usa el formato AAAA-MM-DD",
          });
        }
      }

      if (actualizaEmail) cambiosPaciente.email = nuevoEmail;
      if (Object.keys(cambiosPaciente).length > 0) {
        await paciente.update(cambiosPaciente, { transaction });
      }

      const cambiosUsuario = {};
      if (actualizaEmail) cambiosUsuario.email = nuevoEmail;
      if (passwordHash) cambiosUsuario.password = passwordHash;
      if (Object.keys(cambiosUsuario).length > 0) {
        await usuario.update(cambiosUsuario, { transaction });
      }

      await transaction.commit();

      return {
        usuario: {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol,
          avatar: usuario.avatar,
        },
        paciente: {
          id: paciente.id,
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          cedula: paciente.cedula,
          celular: paciente.celular,
          genero: paciente.genero,
          fecha_nacimiento: paciente.fecha_nacimiento,
          direccion: paciente.direccion,
          email: paciente.email,
          id_usuario: paciente.id_usuario,
        },
      };
    } catch (error) {
      if (!transaction.finished) await transaction.rollback();
      throw error;
    }
  }


  /**
   * Elimina un usuario del sistema mediante su identificador.
   */
  static async eliminarUsuario(id, options = {}) {
    const { transaction } = options;

    const usuario = await Usuario.findByPk(id, { transaction });

    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    // Eliminar el usuario de la base de datos.
    await usuario.destroy({ transaction });

    return true;
  }

  /**
   * Restablece la contraseña de un usuario utilizando un token válido.
   * Verifica que el token exista, no haya expirado y cifra la nueva contraseña.
   */
  static async restablecerPassword(token, nuevaPassword) {
    // 1. Buscar al usuario con el token exacto y verificar que no haya expirado
    const usuario = await Usuario.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          [Op.gt]: new Date() // La fecha de expiración debe ser mayor a la actual
        }
      }
    });

    if (!usuario) {
      throw new AppError("El token de recuperación es inválido o ha expirado", 400);
    }

    // 2. Validar que la nueva contraseña cumpla con las políticas de seguridad
    // Pasamos un correo ficticio o el del usuario solo para reutilizar tu validador
    this.validarDatosCredenciales({ email: usuario.email, password: nuevaPassword });

    // 3. Cifrar la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    // 4. Actualizar la contraseña y limpiar los campos del token para invalidarlo
    await usuario.update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null
    });

    return true;
  }
}

export default UsuarioService;