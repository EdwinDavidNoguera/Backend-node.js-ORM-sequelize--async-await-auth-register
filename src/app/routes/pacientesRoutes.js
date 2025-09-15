import express from 'express';
import {pacienteController} from '../controllers/indexController.js'; //exportado delde el index central para controladores
const router = express.Router();
import verificarRol from '../middlewares/verificarRol.js';
import verificarToken from '../middlewares/verificarToken.js';

// Rutas para /api/pacientes/
router.route('/')
  .get(verificarToken, verificarRol('admin', 'odontologo'), pacienteController.obtenerPacientes)   // Obtener todos los pacientes ...
  .post(verificarToken, verificarRol('admin', 'odontologo'), pacienteController.crearPaciente);    // Crear un nuevo paciente, Rutas para /api/pacientes/:id

  //Ruta literal para /api/pacientes/total

// Rutas parametrizadas para /api/pacientes/:id
router.route('/:id') // Verifica el token y rol antes de acceder
  .get(verificarToken,  verificarRol('admin', 'odontologo'), pacienteController.obtenerPacientePorId)  // Obtener un paciente por ID
  .put(verificarToken,  verificarRol('admin', 'paciente'), pacienteController.actualizarPaciente)    // Actualizar paciente por ID
  .delete(verificarToken,  verificarRol('admin'), pacienteController.eliminarPaciente);  // Eliminar paciente por ID

 export default router;
