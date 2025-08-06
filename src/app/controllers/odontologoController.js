import Usuario from "../models/usuariosModel.js";       // Modelo de usuario
import Odontologo from "../models/odontologosModel.js"; // Modelo de odontólogo

class OdontologoController {

  // ✅🔓🔒🔓🔓🔓🔓🔓 Obtener todos los odontólogos (admin o quienes tengan permisos)
  async obtenerOdontologos(req, res) {
    try {
      const odontologos = await Odontologo.findAll({
        include: { model: Usuario, as: "usuario" }, // Incluye datos del usuario relacionado
      });
      res.json(odontologos);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener odontólogos",
        error: error.message,
      });
    }
  }

  // ✅ Obtener un odontólogo por su ID
  async obtenerOdontologoPorId(req, res) {
    const id = req.params.id;
    try {
      const odontologo = await Odontologo.findByPk(id, {
        include: { model: Usuario, as: "usuario" }, // Muestra también los datos de usuario
      });

      if (!odontologo) {
        return res.status(404).json({
          message: `No se encontró ningún odontólogo con el ID ${id}`,
        });
      }

      res.json(odontologo); // Enviamos el resultado al frontend
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener odontólogo",
        error: error.message,
      });
    }
  }

  // 👨‍⚕️ Crear un nuevo odontólogo
  async crearOdontologo(req, res) {
    const {
      nombre,
      apellido,
      email,
      password,
      rol = "odontologo", // Se asigna por defecto
      foto_perfil,
      especialidad,
      numero_licencia,
      descripcion
    } = req.body;

    // Se crea una transacción para asegurar integridad
    const t = await Usuario.sequelize.transaction();

    try {
      // Primero se crea el usuario
      const nuevoUsuario = await Usuario.create(
        { nombre, apellido, email, password, rol, foto_perfil },
        { transaction: t }
      );

      // Luego se crea el odontólogo usando el mismo ID
      const nuevoOdontologo = await Odontologo.create(
        {
          id: nuevoUsuario.id, // Se asocia al mismo ID de usuario
          especialidad,
          numero_licencia,
          descripcion
        },
        { transaction: t }
      );

      await t.commit(); // Confirmar la transacción si todo sale bien

      // Se devuelve al frontend ambos objetos
      res.status(201).json({
        message: "Odontólogo creado correctamente",
        usuario: nuevoUsuario,
        odontologo: nuevoOdontologo,
      });
    } catch (error) {
      await t.rollback(); // Si algo falla, se deshace todo
      res.status(500).json({
        message: "Error al crear odontólogo",
        error: error.message,
      });
    }
  }

  // ✅ Actualizar datos del odontólogo
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

      // Actualiza ambos modelos
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

  // ✅ Eliminar odontólogo (también elimina el usuario relacionado)
  async eliminarOdontologo(req, res) {
    const id = req.params.id;
    const t = await Usuario.sequelize.transaction();

    try {
      const odontologo = await Odontologo.findByPk(id);
      const usuario = await Usuario.findByPk(id);

      if (!odontologo || !usuario) {
        return res.status(404).json({ message: "Odontólogo no encontrado" });
      }

      // Elimina ambos registros dentro de una transacción
      await odontologo.destroy({ transaction: t });
      await usuario.destroy({ transaction: t });

      await t.commit(); // Confirmar borrado

      res.json({ message: "Odontólogo y usuario eliminados correctamente" });
    } catch (error) {
      await t.rollback(); // Revertir cambios si algo falla
      res.status(500).json({
        message: "Error al eliminar odontólogo",
        error: error.message,
      });
    }
  }
}

export default new OdontologoController();
