import ServicioService from "../services/servicioServices.js";
import { catchAsync } from "../utils/index.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";

class ServicioController {

  /**
   * Registra un nuevo servicio o tratamiento en el catálogo de la clínica.
   * POST /api/servicios
   * Utiliza Multer para recibir opcionalmente una imagen mediante req.file.
   */
  crearServicio = catchAsync(async (req, res) => {
    const nuevoServicio = await ServicioService.crear(req.body, req.file);

    enviarRespuestaExitosa(
      res,
      201,
      "Servicio clínico registrado con éxito",
      nuevoServicio
    );
  });

  /**
   * Obtiene todos los servicios que se encuentran activos.
   * GET /api/servicios
   */
  obtenerTodosServicios = catchAsync(async (req, res) => {
    const servicios = await ServicioService.obtenerTodosServicios();

    enviarRespuestaExitosa(
      res,
      200,
      "Catálogo de servicios activos obtenido",
      servicios
    );
  });

  /**
   * Obtiene la información de un servicio específico mediante su ID.
   * GET /api/servicios/:id
   */
  obtenerServicioPorId = catchAsync(async (req, res) => {
    const { id } = req.params;
    const servicio = await ServicioService.obtenerPorId(id);

    enviarRespuestaExitosa(
      res,
      200,
      "Detalles del servicio obtenidos correctamente",
      servicio
    );
  });

  /**
   * Actualiza la información de un servicio existente.
   * Permite modificar datos como el costo, duración, descripción e imagen.
   * PUT /api/servicios/:id
   */
  actualizarServicio = catchAsync(async (req, res) => {
    const { id } = req.params;

    const servicioActualizado = await ServicioService.actualizar(
      id,
      req.body,
      req.file
    );

    enviarRespuestaExitosa(
      res,
      200,
      "Servicio clínico actualizado correctamente",
      servicioActualizado
    );
  });

  /**
   * Desactiva un servicio mediante una eliminación lógica.
   * El servicio se conserva en la base de datos, pero deja de estar activo.
   * DELETE /api/servicios/:id
   */
  eliminarServicio = catchAsync(async (req, res) => {
    const { id } = req.params;
    const servicio = await ServicioService.eliminar(id);

    enviarRespuestaExitosa(
      res,
      200,
      "El servicio ha sido eliminado exitosamente",
      servicio
    );
  });
}

export default new ServicioController();

