// middlewares/errorMiddleware.js


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
// middlewares/errorGlobal.js
const manejadorRespuestaError = (err, req, res, next) => {
  
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError" ||
    err.name === "SequelizeDatabaseError"
  ) {
    // Reenvía el error al manejador de DB
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


/**
 * USO EN CONTROLADORES:
 * 
 * // Si ocurre un error controlado, lanza una excepción personalizada:
 * if (!usuario) {
 *   // Lanzamos un error con status 404
 *   throw new AppError("Usuario no encontrado", 404);
 * }
 * 
 * // Si todo sale bien, responde normalmente:
 * res.status(200).json({
 *   status: 200,
 *   message: "Usuario encontrado",
 *   data: usuario,
 *   errors: null
 * });
 * 
 * // Si ocurre un error inesperado, pásalo al middleware:
 * } catch (error) {
 *   next(error); // Se envía al middleware global de errores
 * }
 */