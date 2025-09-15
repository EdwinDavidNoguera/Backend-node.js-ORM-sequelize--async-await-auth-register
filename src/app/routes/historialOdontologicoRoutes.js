import express from 'express';
import verificarRol from '../middlewares/verificarRol.js';
import verificarToken from '../middlewares/verificarToken.js';
import historialOdontologicoController from '../controllers/historialOdontologicoController.js';

const router = express.Router();

/**
 * =====================================
 * RUTAS PARA HISTORIALES ODONTOLÓGICOS
 * =====================================
 */

// [POST] /historiales/ -> Crear historial (solo admin y odontólogo)
router.route('/')
  .post(verificarToken, verificarRol('admin', 'odontologo'), historialOdontologicoController.crearHistorial)
  //la ruta get no verifica rol porque lo hace en el controlador
  .get(verificarToken, historialOdontologicoController.obtenerHistoriales);

// [GET] /historiales/:id -> Obtener un historial específico
// [PUT] /historiales/:id -> Actualizar historial (solo admin y odontólogo)
router.route('/:id')
  .get(verificarToken, historialOdontologicoController.obtenerHistorialPorId)
  .put(verificarToken, verificarRol('admin', 'odontologo'), historialOdontologicoController.actualizarHistorial);

// [DELETE] /historiales/:id -> Eliminar historial (solo admin)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('admin'),
  historialOdontologicoController.eliminarHistorial
);

export default router;