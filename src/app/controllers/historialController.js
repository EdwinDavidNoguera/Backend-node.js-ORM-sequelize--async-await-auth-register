import catchAsync from "../utils/errors/catchAsync.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";
import HistorialService from "../services/historialService.js";

class HistorialController {

  static crearHistorial = catchAsync(async (req, res) => {
    const nuevoHistorial = await HistorialService.crearHistorial(req.body);
    enviarRespuestaExitosa(
      res.status(201).json({ success: true, data: nuevoHistorial })
    );
  });

  static obtenerHistorialPorPaciente = catchAsync(async (req, res) => {
    const historial = await HistorialService.obtenerHistorialPorPaciente(
      req.params.id_paciente
    );
    enviarRespuestaExitosa(
      res.status(200).json({ success: true, resultados: historial.length, data: historial })
    );
  });

  static obtenerHistorialPorId = catchAsync(async (req, res) => {
    const historial = await HistorialService.obtenerHistorialPorId(
      req.params.id
    );
    enviarRespuestaExitosa(
      res.status(200).json({ success: true, data: historial })
    );
  });

  static actualizarHistorial = catchAsync(async (req, res) => {
    const historialActualizado = await HistorialService.actualizarHistorial(
      req.params.id,
      req.body
    );
    enviarRespuestaExitosa(
      res.status(200).json({ success: true, data: historialActualizado })
    );
  });
}

export default HistorialController;