import express from 'express';
import OdontologoController from '../controllers/odontologoController.js';
const router = express.Router();

// Rutas para /api/odontologos/
router.route('/')
  .get(OdontologoController.obtenerOdontologos)   // Obtener todos los odontólogos
  .post(OdontologoController.crearOdontologo);    // Crear un nuevo odontólogo

// Rutas para /api/odontologos/:id
router.route('/:id')
  .get(OdontologoController.obtenerOdontologoPorId)  // Obtener odontólogo por ID
  .put(OdontologoController.actualizarOdontologo)    // Actualizar odontólogo por ID
  .delete(OdontologoController.eliminarOdontologo);  // Eliminar odontólogo por ID

export default router;