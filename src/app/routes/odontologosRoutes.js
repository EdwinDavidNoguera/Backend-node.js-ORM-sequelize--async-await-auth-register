import express from 'express';
import OdontologoController from '../controllers/odontologoController.js'; // Importa el controlador directamente desde odontólogoController.js
const router = express.Router();
import verificarRol from '../middlewares/verificarRol.js';
import verificarToken from '../middlewares/verificarToken.js';

// Rutas para /api/odontologos/
router.route('/')
  .get(OdontologoController.obtenerOdontologos)   // Obtener todos los odontólogos
  .post(verificarToken, verificarRol("admin"), OdontologoController.crearOdontologo);    // Crear un nuevo odontólogo

// Rutas para /api/odontologos/:id
router.route('/:id')
  .get(OdontologoController.obtenerOdontologoPorId)  // Obtener odontólogo por ID
  .put(verificarToken, verificarRol("admin","odontologo"),OdontologoController.actualizarOdontologo)    // Actualizar odontólogo por ID
  .delete(verificarToken, verificarRol("admin"),OdontologoController.eliminarOdontologo);  // Eliminar odontólogo por ID

export default router;