import ServicioService from "../services/servicioServices.js";
import { catchAsync } from "../utils/index.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";

class ServicioController {
  /**
   * Registrar un nuevo servicio o tratamiento en el catálogo de la clínica
   * POST /api/servicios
   */
  crearServivicio = catchAsync(async (req, res) => {
    const nuevoServicio = await ServicioService.crear(req.body);
    enviarRespuestaExitosa(res, 201, "Servicio clínico registrado con éxito", nuevoServicio);
  });

  /**
   * Obtener todos los servicios que se encuentran actualmente activos
   * GET /api/servicios
   */
  obtenerTodosServicios = catchAsync(async (req, res) => {
    const servicios = await ServicioService.obtenerTodos();
    enviarRespuestaExitosa(res, 200, "Catálogo de servicios activos obtenido", servicios);
  });

  /**
   * Obtener los detalles de un servicio específico por su ID
   * GET /api/servicios/:id
   */
  obtenerServicioPorId = catchAsync(async (req, res) => {
    const { id } = req.params;
    const servicio = await ServicioService.obtenerPorId(id);
    enviarRespuestaExitosa(res, 200, "Detalles del servicio obtenidos correctamente", servicio);
  });

  /**
   * Modificar atributos de un servicio (Costo, duración, descripción, etc.)
   * PATCH /api/servicios/:id
   */
  actualizarServicio = catchAsync(async (req, res) => {
    const { id } = req.params;
    const servicioActualizado = await ServicioService.actualizar(id, req.body);
    enviarRespuestaExitosa(res, 200, "Servicio clínico actualizado correctamente", servicioActualizado);
  });

  /**
   * Desactivar un servicio del catálogo (Eliminación lógica: activo = false)
   * DELETE /api/servicios/:id
   */
  eliminarServicio = catchAsync(async (req, res) => {
    const { id } = req.params;
    await ServicioService.eliminar(id);
    enviarRespuestaExitosa(res, 200, "El servicio ha sido desactivado y removido de la vista del público exitosamente");
  });
}

export default new ServicioController();