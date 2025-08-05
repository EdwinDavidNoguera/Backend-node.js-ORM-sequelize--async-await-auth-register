import Usuario from "../models/usuariosModel.js";
import Paciente from "../models/pacientesModel.js";
import Odontologo from "../models/odontologosModel.js";

class UsuarioController {
  async crearUsuario(req, res) {
    try {
      const { nombre, apellido, email, password, rol, foto_perfil } = req.body;

      if (!nombre || !apellido || !email || !password || !rol) {
        return res.status(400).json({ message: "Todos los campos obligatorios deben estar completos" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Correo electrónico inválido" });
      }

      if (!["paciente", "odontologo", "admin"].includes(rol)) {
        return res.status(400).json({ message: "Rol inválido" });
      }

      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ message: "El correo ya está registrado" });
      }

      const nuevoUsuario = await Usuario.create({
        nombre,
        apellido,
        email,
        password,
        rol,
        foto_perfil
      });

      if (rol === "paciente") {
        await Paciente.create({ usuarioId: nuevoUsuario.id });
      } else if (rol === "odontologo") {
        await Odontologo.create({ usuarioId: nuevoUsuario.id });
      }

      res.status(201).json({ message: "Usuario creado exitosamente", usuario: nuevoUsuario });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res.status(500).json({ message: "Error del servidor" });
    }
  }

  async obtenerUsuarios(req, res) {
    try {
      const usuarios = await Usuario.findAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  }

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

  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { nombre, apellido, email, password, foto_perfil } = req.body;

      const usuario = await Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

      await usuario.update({
        nombre: nombre ?? usuario.nombre,
        apellido: apellido ?? usuario.apellido,
        email: email ?? usuario.email,
        password: password ?? usuario.password,
        foto_perfil: foto_perfil ?? usuario.foto_perfil,
      });

      res.json({ message: "Usuario actualizado correctamente", usuario });
    } catch (error) {
      res.status(500).json({ message: "Error al actualizar el usuario" });
    }
  }

  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id);
      if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

      await usuario.destroy();

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  }
}

// ✅ exportar una instancia
export default new UsuarioController();
