import Usuario from "../models/usuariosModel.js";        // Modelo principal de usuarios (tabla usuarios)
import Paciente from "../models/pacientesModel.js";      // Modelo de pacientes (tabla pacientes)
import Odontologo from "../models/odontologosModel.js";  // Modelo de odontólogos (tabla odontólogos)
import bcrypt from 'bcrypt';                             // Librería para encriptar contraseñas

class UsuarioController {

  // Crear un nuevo usuario (y si corresponde, registrar también en paciente u odontólogo)
  async crearUsuario(req, res) {
    try {
      const { nombre, apellido, email, password, rol, foto_perfil } = req.body;

      // Validación de campos obligatorios
      if (!nombre || !apellido || !email || !password || !rol) {
        return res.status(400).json({ message: "Todos los campos obligatorios deben estar completos" });
      }

      // Validación de formato de correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Correo electrónico inválido" });
      }

      // Validación de roles permitidos
      if (!["paciente", "odontologo", "admin"].includes(rol)) {
        return res.status(400).json({ message: "Rol inválido" });
      }

      // Verificar si ya existe un usuario registrado con el mismo email
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ message: "El correo ya está registrado" });
      }

      // Encriptar la contraseña antes de guardarla en la base de datos
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear nuevo usuario en la tabla principal de usuarios
      const nuevoUsuario = await Usuario.create({
        nombre,
        apellido,
        email,
        password: hashedPassword, // Guardamos la contraseña encriptada
        rol,
        foto_perfil
      });

      // Si el usuario es paciente → crear registro en tabla pacientes
      if (rol === "paciente") {
        await Paciente.create({ usuarioId: nuevoUsuario.id });
      } 
      // Si el usuario es odontólogo → crear registro en tabla odontólogos
      else if (rol === "odontologo") {
        await Odontologo.create({ usuarioId: nuevoUsuario.id });
      }

      // Respuesta exitosa con el usuario creado
      res.status(201).json({ message: "Usuario creado exitosamente", usuario: nuevoUsuario });
    } catch (error) {
      console.error(" Error al crear el usuario:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  }

  // Obtener todos los usuarios registrados
  async obtenerUsuarios(req, res) {
    try {
      const usuarios = await Usuario.findAll(); // Consulta todos los registros
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  }

  // Obtener un usuario por su ID
  async obtenerUsuarioPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id); // Busca por clave primaria
      if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el usuario" });
    }
  }

  // Actualizar información de un usuario existente
  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, email, password, foto_perfil } = req.body;

      // Verificar si el usuario existe
      const usuario = await Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

      // Actualizar solo los campos enviados (los demás se mantienen)
      await usuario.update({
        nombre: nombre ?? usuario.nombre,
        apellido: apellido ?? usuario.apellido,
        email: email ?? usuario.email,
        password: password ?? usuario.password, // Si se cambia la contraseña, debería re-encriptarse
        foto_perfil: foto_perfil ?? usuario.foto_perfil,
      });

      res.json({ message: "Usuario actualizado correctamente", usuario });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el usuario" });
    }
  }

  // Eliminar un usuario de la base de datos por ID
  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;

      // Buscar usuario antes de eliminar
      const usuario = await Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

      await usuario.destroy(); // Elimina el registro

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  }
}

// Exporta una única instancia del controlador para ser usada en rutas
export default new UsuarioController();
