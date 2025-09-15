/**
 * Clase personalizada para manejar errores en la aplicación.
 * Extiende la clase Error nativa de JavaScript.
 * 
 * Propiedades:
 * - message: Mensaje descriptivo del error.
 * - statusCode: Código de estado HTTP (por defecto 500).
 * - errors: Detalles adicionales del error (opcional, por ejemplo, errores de validación). 
 *
 * Uso:
 * throw new AppError("Mensaje de error", 400, { campo: "Detalle del error" });
 * Este error puede ser capturado en un middleware global para enviar respuestas uniformes al cliente.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);            // Llama al constructor de la clase padre (Error)
    this.statusCode = statusCode; 
    this.errors = errors;

    // Mantener la pila de llamadas correcta (opcional, pero recomendable)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;


//Errores comunes:
// Error de validación (faltan datos)
// throw new AppError("El campo email es requerido", 400, { campo: "email" });

// // No autenticado
// throw new AppError("Debes iniciar sesión", 401);

// // No autorizado
// throw new AppError("No tienes permisos para acceder a este recurso", 403);

// // Recurso no encontrado
// throw new AppError("Paciente no encontrado", 404);

// // Conflicto (email duplicado)
// throw new AppError("El email ya está registrado", 409);

// // Error interno (algo inesperado)
// throw new AppError("Error en el servidor", 500);

