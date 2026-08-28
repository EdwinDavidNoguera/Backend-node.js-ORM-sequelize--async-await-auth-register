// Middleware global de respuestas de error.


/**
 * Middleware global para el manejo de errores en Express.
 * Este middleware captura cualquier error que ocurra en los controladores
 * y envía una respuesta uniforme al cliente.
 * 
 * - Si el error tiene un statusCode, lo usa; si no, responde con 500 (error interno).
 * - El mensaje se toma del error o se usa uno genérico.
 * - El campo 'errors' puede contener detalles adicionales (por ejemplo, validaciones).
 * - El campo 'data' es null porque hubo un error.
 */
const manejadorRespuestaError = (err, req, res, next) => {
  
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError" ||
    err.name === "SequelizeDatabaseError"
  ) {
    // Delega los errores de Sequelize al manejador especializado.
    return next(err);
  }

  const status = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  res.status(status).json({
    success: false,
    message,
    data: null,
    errors: err.errors || true,
  });
};

export default manejadorRespuestaError;

