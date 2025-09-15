import express from 'express';
import TratamientoController from '../controllers/tratamientoOdontologicoController.js';
import verificarRol from '../middlewares/verificarRol.js';
import verificarToken from '../middlewares/verificarToken.js';

const router = express.Router();

/**
 * =================================================================
 * RUTAS PARA TRATAMIENTOS ODONTOLÓGICOS
 * =================================================================
 */

// [POST] /tratamientos/ -> Crear tratamiento (solo admin y odontólogo)
router.route('/')
  .post(verificarToken, verificarRol('admin', 'odontologo'), TratamientoController.crearTratamiento)
  .get(verificarToken, TratamientoController.obtenerTratamientos);

// [GET] /tratamientos/:id -> Obtener un tratamiento específico
// [PUT] /tratamientos/:id -> Actualizar tratamiento (solo admin y odontólogo)
router.route('/:id')
  .get(verificarToken, TratamientoController.obtenerTratamientoPorId)
  .put(verificarToken, verificarRol('admin', 'odontologo'), TratamientoController.actualizarTratamiento);

// [DELETE] /tratamientos/:id -> Eliminar tratamiento (solo admin)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('admin'),
  TratamientoController.eliminarTratamiento
);

export default router;