import { Usuario } from "../models/usuarioModel.js"; // Asegúrate de importar desde tu index centralizado
import bcrypt from "bcrypt";
import AppError from "../utils/errors/appError.js";

class UsuarioService {
  
  // === VALIDACIONES Y ESPACIOS VACIOS ===
  // Ahora solo validamos lo que le pertenece estrictamente a la tabla 'usuario'
  static validarDatosCredenciales({ email, password }) {
    const errores = {};

    if (!email) errores.email = "El correo es obligatorio";
    if (!password) errores.password = "La contraseña es obligatoria"; 

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !regexEmail.test(email)) {
      errores.email = "El correo electrónico no es válido";
    }

    // Validación fuerte de contraseña (mínimo 8 caracteres, mayúscula, minúscula, número, especial)
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (password && !regexPassword.test(password)) {
      errores.password =
        "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";
    }

    if (Object.keys(errores).length > 0) {
      throw new AppError("Error de validación", 400, errores);
    }
  }

  // ========== CRUD GENERAL ==========

  // Crear usuario (Estrictamente credenciales)
  static async crearUsuario({ email, password, rol, avatar, transaction }) {
    this.validarDatosCredenciales({ email, password });

    // Verificar duplicados (Opcional, pero recomendado hacerlo aquí antes de que truene la BD)
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      throw new AppError("El correo ya está registrado", 409);
    }

    // Encriptar contraseña
    // Nota: Si implementaste el Hook en el modelo que te sugerí antes, puedes quitar esta línea de bcrypt.
    // Lo dejo por seguridad en caso de que no lo hayas puesto.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario (Solo campos permitidos en la BD)
    const nuevoUsuario = await Usuario.create(
      { 
        email, 
        password: hashedPassword, 
        rol, 
        avatar: avatar || 'default-avatar.png' 
      },
      { transaction }
    );

    return nuevoUsuario;
  }

  // Buscar usuario por ID (Ocultando la contraseña por seguridad)
  static async obtenerUsuarioPorId(id) {
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] } // Buena práctica: no devolver el hash
    });
    
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return usuario;
  }

  // Buscar todos los usuarios
  static async obtenerUsuarios() {
    return await Usuario.findAll({
      attributes: { exclude: ['password'] }
    });
  }

  // Actualizar usuario
  static async actualizarUsuario(id, datos, transaction) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const { email, password, avatar, activo, rol } = datos;
    const errores = {};

    // Validación email
    if (email && email !== usuario.email) {
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(email)) errores.email = "El correo electrónico no es válido";
      
      const emailExistente = await Usuario.findOne({ where: { email } });
      if (emailExistente) errores.email = "El correo ya está en uso";
    }

    // Validación y encriptación de contraseña
    let passwordHash;
    if (password) {
      const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!regexPassword.test(password)) {
        errores.password =
          "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";
      } else {
        passwordHash = await bcrypt.hash(password, 10);
      }
    }

    if (Object.keys(errores).length > 0) {
      throw new AppError("Error de validación", 400, errores);
    }

    // Actualizamos solo los campos que existen en la tabla Usuario
    await usuario.update({
      email: email ?? usuario.email,
      password: passwordHash ?? usuario.password,
      avatar: avatar ?? usuario.avatar,
      activo: activo ?? usuario.activo,
      rol: rol ?? usuario.rol
    }, { transaction });

    // Retornamos el usuario sin el password
    const usuarioActualizado = usuario.toJSON();
    delete usuarioActualizado.password;
    
    return usuarioActualizado;
  }

  // Eliminar usuario
  static async eliminarUsuario(id, transaction) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }
    // Al eliminar el usuario, la BD eliminará en cascada al Paciente o al Odontólogo asociado
    await usuario.destroy({ transaction });
    return true;
  }
}

export default UsuarioService;