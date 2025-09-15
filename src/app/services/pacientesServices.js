import Paciente from "../models/pacientesModel.js";
import UsuarioService from "./usuarioService.js";
import  sequelize  from "../models/db.js"; // instancia de Sequelize
import AppError from "../utils/errors/appError.js";

class PacienteService {

  // Validaciones Paciente
  static validarDatosPaciente({ fecha_nacimiento }) {
    const errores = {};

    // Validar fecha de nacimiento YYYY-MM-DD
    if (fecha_nacimiento) {
      const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
      if (!regexFecha.test(fecha_nacimiento)) {
        errores.fecha_nacimiento = "El formato de fecha de nacimiento debe ser YYYY-MM-DD";
      } else {
        const fecha = new Date(fecha_nacimiento);
        if (isNaN(fecha.getTime())) {
          errores.fecha_nacimiento = "La fecha de nacimiento no es válida";
        }
      }
    }

    if (Object.keys(errores).length > 0) {
      throw new AppError("Error de validación", 400, errores);
    }
  }

  // ========================
  // Crear paciente + usuario
  // ========================
  static async crearPaciente({ nombre, apellido, email, password, fecha_nacimiento, celular, genero, foto_perfil }) {
    const transaction = await sequelize.transaction();

    try {
      // Validar datos del paciente
      this.validarDatosPaciente({ fecha_nacimiento });

      // Crear usuario con rol 'paciente'
      const nuevoUsuario = await UsuarioService.crearUsuario({
        nombre,
        apellido,
        email,
        password,
        rol: "paciente",
        celular,
        genero,
        foto_perfil,
        transaction
      });

      // Crear paciente con la misma ID que Usuario
      const nuevoPaciente = await Paciente.create(
        {
          id: nuevoUsuario.id,
          fecha_nacimiento
        },
        { transaction }
      );

      await transaction.commit();
      return { usuario: nuevoUsuario, paciente: nuevoPaciente };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ========================
  // Obtener todos los pacientes
  // ========================
  static async obtenerPacientes() {
    return await Paciente.findAll({
      include: ["usuario"] // incluye datos de usuario
    });
  }

  // ========================
  // Obtener paciente por ID
  // ========================
  static async obtenerPacientePorId(id) {
    const paciente = await Paciente.findByPk(id, {
      include: ["usuario"]
    });
    if (!paciente) throw new AppError("Paciente no encontrado", 404);
    return paciente;
  }

  // ========================
  // Actualizar paciente + usuario
  // ========================
  static async actualizarPaciente(id, datos) {
    const transaction = await sequelize.transaction();

    try {
      const paciente = await Paciente.findByPk(id, { transaction });
      if (!paciente) throw new AppError("Paciente no encontrado", 404);

      // Validar datos del paciente
      this.validarDatosPaciente(datos);

      // Actualizar usuario asociado
      const usuarioActualizado = await UsuarioService.actualizarUsuario(id, datos);

      // Actualizar paciente
      await paciente.update(
        {
          fecha_nacimiento: datos.fecha_nacimiento ?? paciente.fecha_nacimiento
        },
        { transaction }
      );

      await transaction.commit();
      return { usuario: usuarioActualizado, paciente };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ========================
  // Eliminar paciente + usuario
  // ========================
  static async eliminarPaciente(id) {
    const transaction = await sequelize.transaction();

    try {
      const paciente = await Paciente.findByPk(id, { transaction });
      if (!paciente) throw new AppError("Paciente no encontrado", 404);

      // Eliminar paciente
      // alertar si tiene citas asociadas
      const citas = await paciente.countCitas();
      if (citas > 0) {
        return { alerta: `El paciente tiene ${cantidadCitas} citas asociadas` };
      }
      await paciente.destroy({ transaction });

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

export default PacienteService;
