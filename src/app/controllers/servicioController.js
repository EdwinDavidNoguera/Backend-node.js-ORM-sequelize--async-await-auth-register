import ServicioService from "../services/servicioService.js";
import enviarRespuestaExitosa from "../helpers/enviarRespuestaExitosa.js";
import catchAsync from "../utils/errors/catchAsync.js"; 

class ServicioController {

  /**
   * Crear servicio
   */
  static crear = catchAsync(async (req, res) => {
    const servicio = await ServicioService.crear(req.body);
    enviarRespuestaExitosa(res, 201, "Servicio creado correctamente", servicio);
  });

  /**
   * Obtener todos
   */
  static obtenerTodos = catchAsync(async (req, res) => {
    const servicios = await ServicioService.obtenerTodos();
    enviarRespuestaExitosa(res, 200, "Servicios obtenidos correctamente", servicios);
  });

  /**
   * Obtener por ID
   */
  static obtenerPorId = catchAsync(async (req, res) => {
    const servicio = await ServicioService.obtenerPorId(req.params.id);
    enviarRespuestaExitosa(res, 200, "Servicio obtenido correctamente", servicio);
  });

  /**
   * Actualizar
   */
  static actualizar = catchAsync(async (req, res) => {
    const servicio = await ServicioService.actualizar(req.params.id, req.body);
    enviarRespuestaExitosa(res, 200, "Servicio actualizado correctamente", servicio);
  });

  /**
   * Eliminación lógica
   */
  static eliminar = catchAsync(async (req, res) => {
    await ServicioService.eliminar(req.params.id);
    enviarRespuestaExitosa(res, 200, "Servicio eliminado correctamente");
  });
}

export default ServicioController;