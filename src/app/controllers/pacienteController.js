import Usuario from "../models/usuariosModel.js";
import Paciente from "../models/pacientesModel.js";

class PacienteController {
  // ✅ Obtener todos los pacientes con datos de usuario
  async obtenerPacientes(req, res) {
    try {
      const pacientes = await Paciente.findAll({
        include: { model: Usuario, as: "usuario" },
      });
      res.json(pacientes);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener pacientes",
        error: error.message,
      });
    }
  }

  // ✅ Obtener paciente por ID (con JOIN a Usuario)
  async obtenerPacientePorId(req, res) {
    const id = req.params.id;
    try {
      const paciente = await Paciente.findByPk(id, {
        include: { model: Usuario, as: "usuario" },
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

  // ✅ Crear nuevo paciente (crear usuario + paciente)
  async crearPaciente(req, res) {
    const { //recibimos todos los atributos en un solo objeto
      nombre,
      apellido,
      email,
      password,
      rol = "paciente",
      foto_perfil,
      fecha_nacimiento,
      celular,
      genero,
    } = req.body;

    const t = await Usuario.sequelize.transaction();

    try {
      // 1. Crear usuario
      const nuevoUsuario = await Usuario.create(
        {
          nombre,
          apellido,
          email,
          password,
          rol,
          foto_perfil,
        },
        { transaction: t }
      );

      // 2. Crear paciente (usa el mismo id que el usuario por relación 1:1)
      const nuevoPaciente = await Paciente.create(
        {
          id: nuevoUsuario.id,
          fecha_nacimiento,
          celular,
          genero,
        },
        { transaction: t }
      );

      await t.commit();

      res.status(201).json({
        message: "Paciente creado exitosamente",
        usuario: nuevoUsuario,
        paciente: nuevoPaciente,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({
        message: "Error al crear paciente",
        error: error.message,
      });
    }
  }

  // ✅ Actualizar datos de usuario (paciente)
  async actualizarPaciente(req, res) {
    const id = req.params.id;
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
      await paciente.update({ fecha_nacimiento, celular, genero});

      res.json({ message: "Paciente actualizado correctamente" });
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar paciente",
        error: error.message,
      });
    }
  }

  // ✅ Eliminar paciente y su usuario
  async eliminarPaciente(req, res) {
    const id = req.params.id;

    const t = await Usuario.sequelize.transaction();

    try {
      const paciente = await Paciente.findByPk(id);
      const usuario = await Usuario.findByPk(id);

      if (!paciente || !usuario) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

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

// Exportamos una instancia de la clase
export default new PacienteController();