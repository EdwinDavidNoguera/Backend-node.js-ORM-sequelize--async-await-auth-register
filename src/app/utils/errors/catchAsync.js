/**
 * catchAsync (Envoltorio)
 * Función de orden superior que recibe un controlador y devuelve una nueva función.
 * Esta nueva función ejecuta el controlador con req, res y next.
 * 
 * y captura cualquier error que ocurra para enviarlo al middleware de manejo de errores de Express.
 *Expres no captura errores dentro de funciones azyncronas
 * 
 * @param {Function} controller - Función del controlador (async)
 * @returns {Function} - Función lista para usar en rutas de Express
 */
const catchAsync = (controller) => {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next))
      .catch(next); // Captura cualquier error y lo pasa al middleware global
  };
};

export default catchAsync;
