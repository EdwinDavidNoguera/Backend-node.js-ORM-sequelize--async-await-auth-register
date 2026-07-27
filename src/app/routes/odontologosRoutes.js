import express from 'express';
import {odontologoController} from '../controllers/indexController.js'; // Importa el controlador directamente desde odontólogoController.js
const router = express.Router();
import verificarRol from '../middlewares/verificarRol.js';
import verificarToken from '../middlewares/verificarToken.js';

// Rutas para /api/odontologos/
router.route('/')
  .get(odontologoController.obtenerOdontologos)   // Obtener todos los odontólogos
  .post(verificarToken, verificarRol("admin"), odontologoController.crearOdontologo);    // Crear un nuevo odontólogo

// Rutas para /api/odontologos/:id
router.route('/:id')
  .get(odontologoController.obtenerOdontologoPorId)  // Obtener odontólogo por ID
  .put(verificarToken, verificarRol("admin","odontologo"),odontologoController.actualizarOdontologo)    // Actualizar odontólogo por ID
  .delete(verificarToken, verificarRol("admin"),odontologoController.eliminarOdontologo);  // Eliminar odontólogo por ID

export default router;