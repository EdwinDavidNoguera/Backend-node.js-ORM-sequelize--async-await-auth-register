import { HorarioOdontologo, Odontologo } from "../models/indexModel.js";
import AppError from "../utils/errors/appError.js";

/**
 * Esta clase proporciona métodos para gestionar los horarios de los odontólogos.
 * Incluye funcionalidades para crear, obtener y eliminar bloques de horario.
 */

class HorarioOdontologoService {
  static async crearHorario(data, transaction = null) {
    const { id_odontologo, dia_semana, hora_inicio, hora_fin } = data;
    
    // Si no existe, lanzamos el error que será atrapado por el catchAsync
    const odontologo = await Odontologo.findByPk(id_odontologo);
    if (!odontologo) {
      throw new AppError('El odontólogo no existe en el sistema', 404);
    }
    
    return await HorarioOdontologo.create({
      id_odontologo,
      dia_semana,
      hora_inicio,
      hora_fin
    }, { transaction });
  }

  static async obtenerHorarioPorOdontologo(id_odontologo) {
    return await HorarioOdontologo.findAll({
      where: { id_odontologo },
      order: [['dia_semana', 'ASC'], ['hora_inicio', 'ASC']]
    });
  }

  static async eliminarHorario(id) {
    const horario = await HorarioOdontologo.findByPk(id);
    if (!horario) {
      throw new AppError('El bloque de horario que intentas eliminar no existe', 404);
    }
    
    await horario.destroy();
    return { message: 'Horario eliminado correctamente' };
  }
}

export default HorarioOdontologoService;