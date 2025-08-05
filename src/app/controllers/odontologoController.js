import Usuario from "../models/usuariosModel.js";
import Odontologo from "../models/odontologosModel.js";

class OdontologoController {

  // ✅ Obtener todos los odontólogos
  async obtenerOdontologos(req, res) {
    try {
      const odontologos = await Odontologo.findAll({
        include: { model: Usuario, as: "usuario" },
      });
      res.json(odontologos);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener odontólogos",
        error: error.message,
      });
    }
  }

  // ✅ Obtener odontólogo por ID
  async obtenerOdontologoPorId(req, res) {
    const id = req.params.id;
    try {
      const odontologo = await Odontologo.findByPk(id, {
        include: { model: Usuario, as: "usuario" },
      });

      if (!odontologo) {
        return res.status(404).json({
          message: `No se encontró ningún odontólogo con el ID ${id}`,
        });
      }

      res.json(odontologo);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener odontólogo",
        error: error.message,
      });
    }
  }

  // ✅ Crear nuevo odontólogo
  async crearOdontologo(req, res) {
    const {
      nombre,
      apellido,
      email,
      password,
      rol = "odontologo",
      foto_perfil,
      especialidad,
      numero_licencia,
      descripcion

    } = req.body;

    const t = await Usuario.sequelize.transaction();

    try {
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

      const nuevoOdontologo = await Odontologo.create(
        {
          id: nuevoUsuario.id,
          especialidad,
          numero_licencia,
          descripcion
        },
        { transaction: t }
      );

      await t.commit();

    // Enviar respuesta exitosa al crear odontólogo y usuario
    res.status(201).json({
      message: "Odontólogo creado correctamente",
      usuario: nuevoUsuario,
      //odontologo: nuevoOdontologo,
    });
    } catch (error) {
      await t.rollback();
      res.status(500).json({
        message: "Error al crear odontólogo",
        error: error.message,
      });
    }
  }

  // ✅ Actualizar odontólogo
  async actualizarOdontologo(req, res) {
    const id = req.params.id;
    const {
      nombre,
      apellido,
      email,
      password,
      rol,
      foto_perfil,
      especialidad,
      numero_licencia,
      descripcion
    } = req.body;

    try {
      const usuario = await Usuario.findByPk(id);
      const odontologo = await Odontologo.findByPk(id);

      if (!usuario || !odontologo) {
        return res.status(404).json({ message: "Odontólogo no encontrado" });
      }

      await usuario.update({ nombre, apellido, email, password, rol, foto_perfil });
      await odontologo.update({ especialidad, numero_licencia, descripcion });

      res.json({ message: "Odontólogo actualizado correctamente" });
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar odontólogo",
        error: error.message,
      });
    }
  }

  // ✅ Eliminar odontólogo y usuario
  async eliminarOdontologo(req, res) {
    const id = req.params.id;

    const t = await Usuario.sequelize.transaction();

    try {
      const odontologo = await Odontologo.findByPk(id);
      const usuario = await Usuario.findByPk(id);

      if (!odontologo || !usuario) {
        return res.status(404).json({ message: "Odontólogo no encontrado" });
      }

      await odontologo.destroy({ transaction: t });
      await usuario.destroy({ transaction: t });

      await t.commit();

      res.json({ message: "Odontólogo y usuario eliminados correctamente" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({
        message: "Error al eliminar odontólogo",
        error: error.message,
      });
    }
  }
}

export default new OdontologoController();