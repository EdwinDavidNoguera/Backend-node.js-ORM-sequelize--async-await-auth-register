const manejadorErrorEnDB = (err, req, res, next) => {
  // 🟢 Si Express ya envió las cabeceras, delega el error para evitar duplicar respuesta
  if (res.headersSent) {
    return next(err);
  }

  let status = 500;
  let message = "Error en la base de datos";
  let errors = {};

  switch (err.name) {
    case "SequelizeValidationError":
      status = 400;
      message = "Error de validación";
      err.errors.forEach((e) => {
        errors[e.path] = e.message;
      });
      break;

    case "SequelizeUniqueConstraintError":
      status = 409;
      message = "Conflicto: valor ya registrado";
      err.errors.forEach((e) => {
        errors[e.path] = e.message;
      });
      break;

    case "SequelizeConnectionRefusedError":
    case "SequelizeHostNotFoundError":
    case "SequelizeHostNotReachableError":
    case "SequelizeConnectionTimedOutError":
    case "SequelizeConnectionError":
      status = 503;
      message = "Servicio no disponible: error de conexión a la base de datos";
      errors = { detalle: err.message };
      break;

    case "SequelizeDatabaseError":
      status = 500;
      message = "Error en la base de datos";
      errors = {
        detalle: err.parent?.sqlMessage || err.message,
      };
      break;

    default:
      // fallback: error inesperado
      status = err.statusCode || 500;
      message = err.message || "Error interno en la base de datos";
      errors = err.errors || {};
  }

  return res.status(status).json({
    success: false,
    message,
    data: null,
    errors,
  });
};

export default manejadorErrorEnDB;