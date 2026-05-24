import Usuario from "../models/usuarioModel.js"; 
import bcrypt from "bcrypt";
import AppError from "../utils/errors/appError.js";

class UsuarioService {
  
  /**
   * ==========================================
   * VALIDACIÓN CENTRALIZADA (CREACIÓN)
   * ==========================================
   */
  static validarDatosCredenciales({ email, password }) {
    const errores = {};

    // 1. Validar presencia
    if (!email || email.trim() === "") errores.email = "El correo es obligatorio";
    if (!password) errores.password = "La contraseña es obligatoria"; 

    // 2. Validar formato de Email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !regexEmail.test(email.trim())) {
      errores.email = "El correo electrónico no es válido";
    }

    // 3. Validar seguridad de la Contraseña
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (password && !regexPassword.test(password)) {
      errores.password =
        "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";
    }

    // Si hay errores de formato/presencia, se lanzan juntos
    if (Object.keys(errores).length > 0) {
      throw new AppError("Error de validación en las credenciales", 400, errores);
    }
  }

  // ========== CRUD GENERAL ==========

  /**
   * Crear usuario (Estrictamente credenciales)
   */
  static async crearUsuario(datos, options = {}) {
    const { email, password, rol, avatar } = datos;
    const { transaction } = options;

    // 1. Validar formatos y campos obligatorios
    this.validarDatosCredenciales({ email, password });

    // 2. Verificar duplicados respetando la transacción
    const usuarioExistente = await Usuario.findOne({ where: { email: email.trim() }, transaction });
    if (usuarioExistente) {
      // 🎯 Se envía estructurado en un objeto para que el frontend sepa qué input pintar de rojo
      throw new AppError("El correo ya está registrado", 409, { email: "El correo ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario vinculado a la transacción madre
    const nuevoUsuario = await Usuario.create(
      { 
        email: email.trim(), 
        password: hashedPassword, 
        rol, 
        avatar: avatar || 'default-avatar.png' 
      },
      { transaction }
    );

    return nuevoUsuario;
  }

  /**
   * Buscar usuario por ID
   */
  static async obtenerUsuarioPorId(id, options = {}) {
    const { transaction } = options;
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ['password'] },
      transaction
    });
    
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return usuario;
  }

  /**
   * Buscar todos los usuarios
   */
  static async obtenerUsuarios() {
    return await Usuario.findAll({
      attributes: { exclude: ['password'] }
    });
  }

  /**
   * Actualizar usuario (Validación acumulativa interna)
   */
  static async actualizarUsuario(id, datos, options = {}) {
    const { transaction } = options;
    const usuario = await Usuario.findByPk(id, { transaction });
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const { email, password, avatar, activo, rol } = datos;
    const errores = {};

    // 1. Validación acumulativa del Email en actualización
    if (email && email.trim() !== usuario.email) {
      const emailLimpio = email.trim();
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!regexEmail.test(emailLimpio)) {
        errores.email = "El correo electrónico no es válido";
      } else {
        const emailExistente = await Usuario.findOne({ where: { email: emailLimpio }, transaction });
        if (emailExistente) errores.email = "El correo ya está en uso";
      }
    }

    // 2. Validación acumulativa de Contraseña en actualización
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

    // 🔥 Si se acumularon errores en la actualización, se lanzan todos juntos
    if (Object.keys(errores).length > 0) {
      throw new AppError("Error de validación en la actualización", 400, errores);
    }

    // Aplicar cambios
    await usuario.update({
      email: email ? email.trim() : usuario.email,
      password: passwordHash ?? usuario.password,
      avatar: avatar ?? usuario.avatar,
      activo: activo ?? usuario.activo,
      rol: rol ?? usuario.rol
    }, { transaction });

    const usuarioActualizado = usuario.toJSON();
    delete usuarioActualizado.password;
    
    return usuarioActualizado;
  }

  /**
   * Eliminar usuario
   */
  static async eliminarUsuario(id, options = {}) {
    const { transaction } = options;
    
    const usuario = await Usuario.findByPk(id, { transaction });
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }
    
    await usuario.destroy({ transaction });
    return true;
  }
}

export default UsuarioService;