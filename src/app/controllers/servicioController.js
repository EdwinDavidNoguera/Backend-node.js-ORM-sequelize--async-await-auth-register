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

  /**
   * Obtiene los odontólogos capacitados para un servicio específico.
   * GET /api/servicios/:id/odontologos
   */
  obtenerOdontologosPorServicio = catchAsync(async (req, res) => {
    const { id } = req.params;
    const odontologos = await ServicioService.obtenerOdontologosPorServicio(id);

    enviarRespuestaExitosa(
      res,
      200,
      "Odontólogos asignados al servicio obtenidos correctamente",
      odontologos
    );
  });

  /**
   * Asigna o actualiza los servicios que presta un odontólogo.
   * POST /api/servicios/asignar-odontologo
   */
  asignarServiciosAOdontologo = catchAsync(async (req, res) => {
    const { id_odontologo, ids_servicios } = req.body;
    const resultado = await ServicioService.asignarServiciosAOdontologo(
      id_odontologo,
      ids_servicios
    );

    enviarRespuestaExitosa(
      res,
      200,
      "Servicios asignados al odontólogo con éxito",
      resultado
    );
  });
}

export default new ServicioController();