// src/app/controllers/consultorioController.js
import ConsultorioService from "../services/consultorioService.js";
import { catchAsync } from "../utils/index.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";

class ConsultorioController {
  
  static crearConsultorio = catchAsync(async (req, res) => {
    const nuevoConsultorio = await ConsultorioService.crearConsultorio(req.body);
    
    enviarRespuestaExitosa(res.status(201).json({
      success: true,
      message: "Consultorio creado exitosamente",
      data: nuevoConsultorio
    }));
  });

  static obtenerTodosConsultorios = catchAsync(async (req, res) => {
    // Si envían ?todos=true en la query, trae incluso los inactivos
    const soloActivos = req.query.todos !== 'true';
    const consultorios = await ConsultorioService.obtenerConsultorios(soloActivos);
    
    enviarRespuestaExitosa(res.status(200).json({
      success: true,
      message: "Consultorios obtenidos exitosamente",
      results: consultorios.length,
      data: consultorios
    }));
  });

  static obtenerConsultorioPorId = catchAsync(async (req, res) => {
    const { id } = req.params;
    const consultorio = await ConsultorioService.obtenerConsultorioPorId(id);
    
    enviarRespuestaExitosa(res.status(200).json({
      success: true,
      message: "Consultorio obtenido exitosamente",
      data: consultorio
    }));
  });

  static actualizarConsultorio = catchAsync(async (req, res) => {
    const { id } = req.params;
    const consultorioActualizado = await ConsultorioService.actualizarConsultorio(id, req.body);
    
    enviarRespuestaExitosa(res.status(200).json({
      success: true,
      message: "Consultorio actualizado exitosamente",
      data: consultorioActualizado
    }));
  });

  static eliminarConsultorio = catchAsync(async (req, res) => {
    const { id } = req.params;
    await ConsultorioService.eliminarConsultorio(id);
    
    enviarRespuestaExitosa(res.status(200).json({
      success: true,
      message: "Consultorio eliminado correctamente"
    }));
  });
}

export default ConsultorioController;