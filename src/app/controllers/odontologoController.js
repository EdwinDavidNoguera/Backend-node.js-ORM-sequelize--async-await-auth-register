import OdontologoService from "../services/odontologoServices.js";
import { catchAsync } from "../utils/index.js"; // Ajusta la ruta según tu index centralizado
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";

class OdontologoController {
  /**
   * Crear perfil de odontólogo junto a sus credenciales de usuario
   * POST /api/odontologos
   */
  crearOdontologo = catchAsync(async (req, res) => {
    // Enviamos el cuerpo de la petición al servicio
    const resultado = await OdontologoService.crearOdontologo(req.body);

    // Ocultamos el hash de la contraseña en la respuesta HTTP por seguridad
    if (resultado.usuario) {
      resultado.usuario = resultado.usuario.toJSON();
      delete resultado.usuario.password;
    }

    enviarRespuestaExitosa(res, 201, "Odontólogo y cuenta creados correctamente", resultado);
  });

  /**
   * Obtener el listado global de odontólogos (Incluye datos de su cuenta de usuario)
   * GET /api/odontologos
   */
  obtenerOdontologos = catchAsync(async (req, res) => {
    const odontologos = await OdontologoService.obtenerOdontologos();
    enviarRespuestaExitosa(res, 200, "Listado de odontólogos obtenido con éxito", odontologos);
  });

  /**
   * Obtener la ficha completa de un odontólogo específico por ID
   * GET /api/odontologos/:id
   */
  obtenerOdontologoPorId = catchAsync(async (req, res) => {
    const { id } = req.params;
    const odontologo = await OdontologoService.obtenerOdontologoPorId(id);
    enviarRespuestaExitosa(res, 200, "Odontólogo encontrado con éxito", odontologo);
  });

  /**
   * Actualizar datos clínicos o credenciales (email/password) del odontólogo
   * PATCH /api/odontologos/:id
   */
  actualizarOdontologo = catchAsync(async (req, res) => {
    const { id } = req.params;
    const resultado = await OdontologoService.actualizarOdontologo(id, req.body);

    // Si se modificaron credenciales, removemos el password de la respuesta
    if (resultado.usuario) {
      resultado.usuario = typeof resultado.usuario.toJSON === 'function' 
        ? resultado.usuario.toJSON() 
        : resultado.usuario;
      delete resultado.usuario.password;
    }

    enviarRespuestaExitosa(res, 200, "Odontólogo actualizado correctamente", resultado);
  });

  /**
   * Eliminar un odontólogo de forma física con comprobación de agenda previa
   * DELETE /api/odontologos/:id
   */
  eliminarOdontologo = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    // Captura si el frontend envía la query string ?force=true para saltar la validación
    const force = req.query.force === "true";

    const resultado = await OdontologoService.eliminarOdontologo(id, force);

    // CASO ALERTA: Si hay citas agendadas y no viene forzado, retornamos los datos para gatillar el Dialog en React
    if (resultado.requiereConfirmacion) {
      return enviarRespuestaExitosa(res, 200, resultado.message, {
        requiereConfirmacion: true,
        totalCitas: resultado.totalCitas,
      });
    }

    // CASO ÉXITO: Si no tenía citas o el admin aceptó el riesgo (?force=true)
    enviarRespuestaExitosa(res, 200, "Odontólogo y sus credenciales asociados eliminados con éxito.");
  });
}

export default new OdontologoController();