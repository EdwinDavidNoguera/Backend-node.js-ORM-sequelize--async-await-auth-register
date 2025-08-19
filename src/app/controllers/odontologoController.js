import Usuario from "../models/usuariosModel.js";       // Modelo de usuarios (tabla general de credenciales y datos básicos)
import Odontologo from "../models/odontologosModel.js"; // Modelo de odontólogos (datos profesionales)
import bcrypt from 'bcrypt';                            // Para encriptar contraseñas

class OdontologoController {

  //  Obtener todos los odontólogos junto con sus datos de usuario
  async obtenerOdontologos(req, res) {
    try {
      const odontologos = await Odontologo.findAll({
        include: { model: Usuario, as: "usuario" }, // Relación con la tabla de usuarios
      });
      res.json(odontologos);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener odontólogos",
        error: error.message,
      });
    }
  }

  // Obtener un odontólogo por su ID
  async obtenerOdontologoPorId(req, res) {
    const id = req.params.id;
    try {
      const odontologo = await Odontologo.findByPk(id, {
        include: { model: Usuario, as: "usuario" }, // Incluye también datos de usuario
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

  //  Crear un nuevo odontólogo (se registran datos de usuario + odontólogo)
  async crearOdontologo(req, res) {
    const {
      nombre,
      apellido,
      email,
      password,
      rol = "odontologo", // Por defecto, el rol es "odontólogo"
      foto_perfil,
      especialidad,
      numero_licencia,
      descripcion
    } = req.body;

    // Se usa transacción para asegurar integridad entre usuario y odontólogo
    const t = await Usuario.sequelize.transaction();
    
    try {
      // Validaciones mínimas
      if (!nombre || !apellido || !email || !password || !especialidad || !numero_licencia) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
      }

      //validar email duplicado
  
      const emailExistente = await Usuario.findOne({ where: { email } });
      if (emailExistente) {
        return res.status(400).json({ message: "El email ya está en uso" });
      }

      //validar numero de licencia duplicado
      const licenciaExistente = await Odontologo.findOne({ where: { numero_licencia } });
      if (licenciaExistente) {
        return res.status(400).json({ message: "El número de licencia ya está en uso" });
      }

      //  Crear el usuario con la contraseña encriptada
      const passwordEncriptada = await bcrypt.hash(password, 10);
      const nuevoUsuario = await Usuario.create(
        { nombre, apellido, email, password: passwordEncriptada, rol, foto_perfil },
        { transaction: t }
      );

      //  Crear el odontólogo asociado al usuario recién creado
      const nuevoOdontologo = await Odontologo.create(
        {
          id: nuevoUsuario.id, // Se utiliza el mismo ID del usuario
          especialidad,
          numero_licencia,
          descripcion
        },
        { transaction: t }
      );

      await t.commit(); // Confirmar transacción si todo salió bien

      res.status(201).json({
        message: "Odontólogo creado correctamente",
        usuario: nuevoUsuario,
        odontologo: nuevoOdontologo,
      });
    } catch (error) {
      await t.rollback(); // Revertir si algo falla
      res.status(500).json({
        message: "Error al crear odontólogo",
        error: error.message,
      });
    }
  }

  // Actualizar datos de un odontólogo y su usuario asociado
  async actualizarOdontologo(req, res) {
    const id = req.params.id; //toma el id de los parámetros de la solicitud req
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

      // Actualizar datos en ambos modelos
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

  // Eliminar un odontólogo (y su usuario relacionado)
  async eliminarOdontologo(req, res) {
    const id = req.params.id;
    const t = await Usuario.sequelize.transaction();

    try {
      const odontologo = await Odontologo.findByPk(id);
      const usuario = await Usuario.findByPk(id);

      if (!odontologo || !usuario) {
        return res.status(404).json({ message: "Odontólogo no encontrado" });
      }

      // Eliminar ambos registros en la misma transacción
      await odontologo.destroy({ transaction: t });
      await usuario.destroy({ transaction: t });

      await t.commit(); // Confirmar borrado

      res.json({ message: "Odontólogo y usuario eliminados correctamente" });
    } catch (error) {
      await t.rollback(); // Revertir si algo falla
      res.status(500).json({
        message: "Error al eliminar odontólogo",
        error: error.message,
      });
    }
  }
}

export default new OdontologoController();
