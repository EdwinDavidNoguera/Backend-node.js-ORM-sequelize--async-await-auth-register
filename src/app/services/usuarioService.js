import Usuario from "../models/usuariosModel.js";
import bcrypt from "bcrypt";
import AppError from "../utils/errors/appError.js";

class UsuarioService {
  
  // ========== VALIDACIONES ==========
  static validarDatosGenerales({ nombre, apellido, email, celular, password }) {
    const errores = {};

    if (!nombre) errores.nombre = "El nombre es obligatorio";
    if (!apellido) errores.apellido = "El apellido es obligatorio";
    if (!email) errores.email = "El correo es obligatorio";
    if (!password) errores.password = "La contraseña es obligatoria"; 


    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const regexCelular = /^\+?[1-9]\d{1,14}$/; // Formato E.164

    if (email && !regexEmail.test(email)) {
      errores.email = "El correo electrónico no es válido";
    }

    if (password && !regexPassword.test(password)) {
      errores.password =
        "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";
    }

    if (celular && !regexCelular.test(celular)) {
      errores.celular = "El número de celular no parece válido, rectifique colocando algo como 3001234567";
    }

    if (Object.keys(errores).length > 0) {
      throw new AppError("Error de validación", 400, errores);
    }

  }

  // ========== CRUD GENERAL ==========

  // Crear usuario
  static async crearUsuario({ nombre, apellido, email, password, rol, foto_perfil, celular, genero, transaction }) {
    this.validarDatosGenerales({ nombre, apellido, email, password, celular });

    // Verificar duplicados
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      throw new AppError("El correo ya está registrado", 409);
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await Usuario.create(
      { nombre, apellido, email, password: hashedPassword, rol, foto_perfil , celular, genero },
      { transaction }
    );

    return nuevoUsuario;
  }

  // Buscar usuario por ID
  static async obtenerUsuarioPorId(id) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return usuario;
  }

  // Buscar todos los usuarios
  static async obtenerUsuarios() {
    return await Usuario.findAll();
  }

  // Actualizar usuario
  static async actualizarUsuario(id, datos) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }

    const { nombre, apellido, email, password, foto_perfil, celular, genero } = datos;
    const errores = {};

    // Validación email
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && email !== usuario.email) {
      if (!regexEmail.test(email)) errores.email = "El correo electrónico no es válido";
      const emailExistente = await Usuario.findOne({ where: { email } });
      if (emailExistente) errores.email = "El correo ya está en uso";
    }

    // Validación contraseña
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

    // Validación celular
    const regexCelular = /^\+?[1-9]\d{1,14}$/;
    if (celular && !regexCelular.test(celular)) {
      errores.celular = "El número de celular no parece válido, rectifique colocando algo como 3001234567";
    }

    if (Object.keys(errores).length > 0) {
      throw new AppError("Error de validación", 400, errores);
    }

    await usuario.update({
      nombre: nombre ?? usuario.nombre,
      apellido: apellido ?? usuario.apellido,
      email: email ?? usuario.email,
      password: passwordHash ?? usuario.password,
      celular: celular ?? usuario.celular,
      genero: genero ?? usuario.genero,
      foto_perfil: foto_perfil ?? usuario.foto_perfil,
    });

    return usuario;
  }

  // Eliminar usuario
  static async eliminarUsuario(id, transaction) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw new AppError("Usuario no encontrado", 404);
    }
    await usuario.destroy({ transaction });
    return true;
  }
}

export default UsuarioService;
