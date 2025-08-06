import Usuario from "../models/usuariosModel.js";        // Modelo principal de usuarios
import Paciente from "../models/pacientesModel.js";      // Modelo de pacientes
import Odontologo from "../models/odontologosModel.js";  // Modelo de odontólogos

class UsuarioController {

  // ✅ Crear nuevo usuario (y si es necesario, crear también su paciente u odontólogo)
  async crearUsuario(req, res) {
    try {
      const { nombre, apellido, email, password, rol, foto_perfil } = req.body;

      // Validación de campos obligatorios
      if (!nombre || !apellido || !email || !password || !rol) {
        return res.status(400).json({ message: "Todos los campos obligatorios deben estar completos" });
      }

      // Validación de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Correo electrónico inválido" });
      }

      // Validación de roles válidos
      if (!["paciente", "odontologo", "admin"].includes(rol)) {
        return res.status(400).json({ message: "Rol inválido" });
      }

      // Verificar si ya existe un usuario con ese email
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ message: "El correo ya está registrado" });
      }

      // Crear el nuevo usuario
      const nuevoUsuario = await Usuario.create({
        nombre,
        apellido,
        email,
        password,        // IMPORTANTE: aquí deberías encriptarlo (ver nota más abajo)
        rol,
        foto_perfil
      });

      // Si es paciente, se crea registro en tabla pacientes
      if (rol === "paciente") {
        await Paciente.create({ usuarioId: nuevoUsuario.id });
      } 
      // Si es odontólogo, se crea en tabla odontólogos
      else if (rol === "odontologo") {
        await Odontologo.create({ usuarioId: nuevoUsuario.id });
      }

      // Respuesta exitosa
      res.status(201).json({ message: "Usuario creado exitosamente", usuario: nuevoUsuario });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  }

  // ✅ Obtener todos los usuarios
  async obtenerUsuarios(req, res) {
    try {
      const usuarios = await Usuario.findAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  }

  // ✅ Obtener usuario por su ID
  async obtenerUsuarioPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener el usuario" });
    }
  }

  // ✅ Actualizar un usuario (con campos opcionales)
  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, email, password, foto_perfil } = req.body;

      const usuario = await Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

      // Actualiza solo si el campo fue enviado (usa el valor actual si no)
      await usuario.update({
        nombre: nombre ?? usuario.nombre,
        apellido: apellido ?? usuario.apellido,
        email: email ?? usuario.email,
        password: password ?? usuario.password, // ⚠️ Asegúrate de encriptar si se cambia
        foto_perfil: foto_perfil ?? usuario.foto_perfil,
      });

      res.json({ message: "Usuario actualizado correctamente", usuario });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el usuario" });
    }
  }

  // ✅ Eliminar un usuario por ID
  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

      await usuario.destroy(); // Borra el usuario

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  }
}

// ✅ Exporta una única instancia del controlador
export default new UsuarioController();
