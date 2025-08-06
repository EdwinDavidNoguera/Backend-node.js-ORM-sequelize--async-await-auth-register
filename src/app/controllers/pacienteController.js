import Usuario from "../models/usuariosModel.js";    // Modelo de usuario
import Paciente from "../models/pacientesModel.js";  // Modelo de paciente
import bcrypt from 'bcrypt';                         // Para hashear contraseñas

class PacienteController {

  // ✅ Obtener todos los pacientes junto a sus datos de usuario
  async obtenerPacientes(req, res) {
    try {
      const pacientes = await Paciente.findAll({
        include: { model: Usuario, as: "usuario" },  // JOIN con usuario
      });
      res.json(pacientes);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener pacientes",
        error: error.message,
      });
    }
  }

  // ✅ Obtener un paciente por ID (con datos de usuario)
  async obtenerPacientePorId(req, res) {
    const id = req.params.id;
    try {
      const paciente = await Paciente.findByPk(id, {
        include: { model: Usuario, as: "usuario" }, // JOIN con tabla usuarios
      });

      if (!paciente) {
        return res.status(404).json({
          message: `No se encontró ningún paciente con el ID ${id}`,
        });
      }

      res.json(paciente);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener paciente",
        error: error.message,
      });
    }
  }

  // ✅ Crear un nuevo paciente (crea usuario + paciente)
  async crearPaciente(req, res) {
    const {
      nombre,
      apellido,
      email,
      password,
      rol = "paciente", // por defecto es paciente
      foto_perfil,
      fecha_nacimiento,
      celular,
      genero,
    } = req.body;

    const t = await Usuario.sequelize.transaction(); // Transacción para asegurar integridad

    try {
      // 🔐 Hashear la contraseña antes de guardar
      const hashedPassword = await bcrypt.hash(password, 10);

      // 1. Crear usuario
      const nuevoUsuario = await Usuario.create(
        {
          nombre,
          apellido,
          email,
          password: hashedPassword,
          rol,
          foto_perfil,
        },
        { transaction: t }
      );

      // 2. Crear paciente usando el ID del usuario
      const nuevoPaciente = await Paciente.create(
        {
          id: nuevoUsuario.id,
          fecha_nacimiento,
          celular,
          genero,
        },
        { transaction: t }
      );

      await t.commit(); // Confirmar la transacción

      res.status(201).json({
        message: "Paciente creado exitosamente",
        usuario: nuevoUsuario,
        paciente: nuevoPaciente,
      });
    } catch (error) {
      await t.rollback(); // Si algo falla, se revierte todo
      res.status(500).json({
        message: "Error al crear paciente",
        error: error.message,
      });
    }
  }

  // ✅ Actualizar paciente (solo el propio si es rol paciente)
  async actualizarPaciente(req, res) {
    const id = req.params.id;
    const rolUsuario = req.user.rol;    // rol extraído del token
    const idUsuario = req.user.id;      // id extraído del token

    // ⚠️ Si es paciente, no puede modificar otros pacientes
    if (rolUsuario === 'paciente' && idUsuario !== id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para modificar otro paciente' });
    }

    const {
      nombre,
      apellido,
      email,
      password,
      rol,
      foto_perfil,
      fecha_nacimiento,
      celular,
      genero
    } = req.body;

    try {
      const usuario = await Usuario.findByPk(id);
      const paciente = await Paciente.findByPk(id);

      if (!usuario || !paciente) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      await usuario.update({ nombre, apellido, email, password, rol, foto_perfil });
      await paciente.update({ fecha_nacimiento, celular, genero });

      res.json({ message: "Paciente actualizado correctamente" });
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar paciente",
        error: error.message,
      });
    }
  }

  // ✅ Eliminar un paciente y su usuario
  async eliminarPaciente(req, res) {
    const id = req.params.id;
    const t = await Usuario.sequelize.transaction();

    try {
      const paciente = await Paciente.findByPk(id);
      const usuario = await Usuario.findByPk(id);

      if (!paciente || !usuario) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      // Elimina primero paciente, luego usuario (dentro de la misma transacción)
      await paciente.destroy({ transaction: t });
      await usuario.destroy({ transaction: t });

      await t.commit();

      res.json({ message: "Paciente y usuario eliminados correctamente" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({
        message: "Error al eliminar paciente",
        error: error.message,
      });
    }
  }
}

// Exportamos una instancia para ser usada en las rutas
export default new PacienteController();
