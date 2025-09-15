/**
 * Helper para enviar respuestas uniformes de éxito.
 *
 * @param {Response} res - Objeto de respuesta de Express
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje de la respuesta
 * @param {any} data - Datos a devolver al cliente
 */
const enviarRespuestaExitosa = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,     // Siempre true en caso de éxito
    message,           // Mensaje descriptivo
    data,              // Datos de la operación
    errors: false      // No hay errores
  });
};

export default enviarRespuestaExitosa;
