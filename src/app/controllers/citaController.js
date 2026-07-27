// src/app/controllers/citaController.js
import catchAsync from "../utils/errors/catchAsync.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";
import CitaService from "../services/citaService.js";

class CitaController {

  static crearCita = catchAsync(async (req, res) => {
    const nuevaCita = await CitaService.crearCita(req.body);
    enviarRespuestaExitosa(
      res.status(201).json({ success: true, data: nuevaCita })
    );
  });

  static obtenerCitas = catchAsync(async (req, res) => {
    const citas = await CitaService.obtenerCitas(req.query);
    enviarRespuestaExitosa(
      res.status(200).json({ success: true, resultados: citas.length, data: citas })
    );
  });

  static obtenerCitaPorId = catchAsync(async (req, res) => {
    const cita = await CitaService.obtenerCitaPorId(req.params.id);
    enviarRespuestaExitosa(
      res.status(200).json({ success: true, data: cita })
    );
  });

  static obtenerCitasPorOdontologo = catchAsync(async (req, res) => {
    const citas = await CitaService.obtenerCitasPorOdontologo(
      req.params.id_odontologo,
      req.query
    );
    enviarRespuestaExitosa(
      res.status(200).json({ success: true, resultados: citas.length, data: citas })
    );
  });

  static obtenerCitasPorPaciente = catchAsync(async (req, res) => {
    const citas = await CitaService.obtenerCitasPorPaciente(
      req.params.id_paciente,
      req.query
    );
    enviarRespuestaExitosa(
      res.status(200).json({ success: true, resultados: citas.length, data: citas })
    );
  });

  static actualizarCita = catchAsync(async (req, res) => {
    const citaActualizada = await CitaService.actualizarCita(
      req.params.id,
      req.body
    );
    enviarRespuestaExitosa(
      res.status(200).json({ success: true, data: citaActualizada })
    );
  });

  static cancelarCita = catchAsync(async (req, res) => {
    const citaCancelada = await CitaService.cancelarCita(req.params.id);
    enviarRespuestaExitosa(
      res.status(200).json({ success: true, data: citaCancelada })
    );
  });
}

export default CitaController;