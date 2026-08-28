/**
 * Clase personalizada para manejar errores en la aplicación del servidor.
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
  constructor(message, statusCode = 400, errors = null) {
    super(message);            // Inicializa la clase base Error.
    this.statusCode = statusCode;
    this.errors = errors;

    // Excluye el constructor de AppError de la pila de llamadas.
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;


// Ejemplos de errores controlados:
// Error de validación.
// throw new AppError("El campo email es requerido", 400, { campo: "email" });

// Error de autenticación.
// throw new AppError("Debes iniciar sesión", 401);

// Error de autorización.
// throw new AppError("No tienes permisos para acceder a este recurso", 403);

// Recurso no encontrado.
// throw new AppError("Paciente no encontrado", 404);

// Conflicto por correo duplicado.
// throw new AppError("El email ya está registrado", 409);

// Error interno inesperado.
// throw new AppError("Error en el servidor", 500);

