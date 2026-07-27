// src/app/controllers/horarioOdontologoController.js

import HorarioOdontologoService from "../services/horarioOdontologoService.js";
import { catchAsync } from "../utils/index.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";

class HorarioOdontologoController {

  /**
   * Registrar un nuevo horario para un odontólogo
   * POST /api/horarios
   */
  crearHorario = catchAsync(async (req, res) => {
    const nuevoHorario = await HorarioOdontologoService.crearHorario(req.body);

    enviarRespuestaExitosa(
      res,
      201,
      "Horario registrado correctamente",
      nuevoHorario
    );
  });

  /**
   * Obtener todos los horarios de un odontólogo
   * GET /api/horarios/:id_odontologo
   */
  obtenerHorario = catchAsync(async (req, res) => {
    const { id_odontologo } = req.params;

    const horarios = await HorarioOdontologoService.obtenerHorarioPorOdontologo(id_odontologo);

    enviarRespuestaExitosa(
      res,
      200,
      "Horarios obtenidos correctamente",
      horarios
    );
  });

  /**
   * Eliminar un horario
   * DELETE /api/horarios/:id
   */
  eliminarHorario = catchAsync(async (req, res) => {
    const { id } = req.params;

    const resultado = await HorarioOdontologoService.eliminarHorario(id);

    enviarRespuestaExitosa(
      res,
      200,
      "Horario eliminado correctamente",
      resultado
    );
  });

}

export default new HorarioOdontologoController();