// middlewares/errorMiddleware.js

import e from "express";

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
const manejadorError = (err, req, res, next) => {
  const status = err.statusCode || 500; // Usa el código de estado del error o 500 por defecto
  const message = err.message || "Error interno del servidor"; // Mensaje del error o uno genérico

  res.status(status).json({
    success: false ,               // Código de estado HTTP
    message,               // Mensaje de error
    data: null,            // No hay datos cuando ocurre un error
    errors: err.errors || true // ni no hay errores envia true 
  });
};
export default manejadorError

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