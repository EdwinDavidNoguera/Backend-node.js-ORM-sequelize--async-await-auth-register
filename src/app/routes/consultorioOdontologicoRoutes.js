import express from 'express';
import ConsultorioController from '../controllers/consultorioController.js';
import verificarRol from '../middlewares/verificarRol.js';
import verificarToken from '../middlewares/verificarToken.js';

const router = express.Router();

/**
 * =================================================================
 * RUTAS PARA CONSULTORIOS ODONTOLÓGICOS
 * =================================================================
 */

// [POST /GET] /consultorios/ -> Crear un nuevo consultorio (solo admin)
router.route('/')
  .post(verificarToken, verificarRol('admin'), ConsultorioController.crearConsultorio)
  .get(verificarToken, verificarRol('admin'), ConsultorioController.obtenerConsultorios);

// [GET] /consultorios/:id -> Obtener un consultorio específico
// [PUT] /consultorios/:id -> Actualizar consultorio (solo admin)
router.route('/:id')
  .get(verificarToken, verificarRol('admin'), ConsultorioController.obtenerConsultorioPorId)
  .put(verificarToken, verificarRol('admin'), ConsultorioController.actualizarConsultorio);

// [DELETE] /consultorios/:id -> Eliminar consultorio (solo admin)
router.delete(
  '/:id',
  verificarToken,
  verificarRol('admin'),
  ConsultorioController.eliminarConsultorio
);

export default router;