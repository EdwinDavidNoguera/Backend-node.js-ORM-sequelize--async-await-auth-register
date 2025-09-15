import Odontologo from "../models/odontologosModel.js";
import UsuarioService from "./usuarioService.js";
import  sequelize  from "../models/db.js";
import AppError from "../utils/errors/appError.js";

class OdontologoService { 

  // ========================
  // Validaciones Odontólogo
  // ========================
  static validarDatosOdontologo({ especialidad, numero_licencia, description }) {
    const errores = {};

    if (!especialidad) errores.especialidad = "La especialidad es obligatoria";
    if (!numero_licencia) errores.numero_licencia = "El número de licencia es obligatorio";
    if (description && description.length < 10) errores.description = "La descripción debe tener al menos 10 caracteres";

    if (Object.keys(errores).length > 0) {
      throw new AppError("Error de validación", 400, errores);
    }
  }

  // ========================
  // Crear odontólogo + usuario
  // ========================
  static async crearOdontologo({ nombre, apellido, email, password, especialidad, numero_licencia, celular, genero, foto_perfil }) {
    const transaction = await sequelize.transaction();

    try {
      this.validarDatosOdontologo({ especialidad, numero_licencia, description });

      // Crear usuario con rol 'odontologo'
      const nuevoUsuario = await UsuarioService.crearUsuario({
        nombre,
        apellido,
        email,
        password,
        rol: "odontologo",
        celular,
        genero,
        foto_perfil,
        transaction
      });

      // Crear odontólogo con la misma ID que Usuario
      const nuevoOdontologo = await Odontologo.create(
        {
          id: nuevoUsuario.id,
          especialidad,
          numero_licencia,
          description
        },
        { transaction }
      );

      await transaction.commit();
      return { usuario: nuevoUsuario, odontologo: nuevoOdontologo };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ========================
  // Obtener todos los odontólogos
  // ========================
  static async obtenerOdontologos() {
    return await Odontologo.findAll({
      include: ["usuario"]
    });
  }

  // ========================
  // Obtener odontólogo por ID
  // ========================
  static async obtenerOdontologoPorId(id) {
    const odontologo = await Odontologo.findByPk(id, { include: ["usuario"] });
    if (!odontologo) throw new AppError("Odontólogo no encontrado", 404);
    return odontologo;
  }

  // ========================
  // Actualizar odontólogo + usuario
  // ========================
  static async actualizarOdontologo(id, datos) {
    const transaction = await sequelize.transaction();

    try {
      const odontologo = await Odontologo.findByPk(id, { transaction });
      if (!odontologo) throw new AppError("Odontólogo no encontrado", 404);

      this.validarDatosOdontologo(datos);

      // Actualizar usuario asociado
      const usuarioActualizado = await UsuarioService.actualizarUsuario(id, datos);

      // Actualizar campos específicos odontólogo
      await odontologo.update(
        {
          especialidad: datos.especialidad ?? odontologo.especialidad,
          numero_licencia: datos.numero_licencia ?? odontologo.numero_licencia
        },
        { transaction }
      );

      await transaction.commit();
      return { usuario: usuarioActualizado, odontologo };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ========================
  // Eliminar odontólogo + usuario
  // ========================
  static async eliminarOdontologo(id) {
    const transaction = await sequelize.transaction();

    try {
      const odontologo = await Odontologo.findByPk(id, { transaction });
      if (!odontologo) throw new AppError("Odontólogo no encontrado", 404);

      // Eliminar odontólogo
      await odontologo.destroy({ transaction });

      // Eliminar usuario asociado
      await UsuarioService.eliminarUsuario(id, transaction);

      await transaction.commit();
      return true;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default OdontologoService;
