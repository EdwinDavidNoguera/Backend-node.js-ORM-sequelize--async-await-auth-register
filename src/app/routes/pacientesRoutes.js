import express from 'express';
// Importa el controlador desde el índice central.
import {pacienteController} from '../controllers/indexController.js'; 
const router = express.Router();
import verificarRol from '../middlewares/verificarRol.js';
import verificarToken from '../middlewares/verificarToken.js';

// Operaciones sobre la colección de pacientes.
router.route('/')
  .get( verificarToken, verificarRol('ODONTOLOGO', 'ADMIN'), pacienteController.obtenerPacientes)   
  .post(pacienteController.registrarPacienteConUsuario);

// Procesa el registro de un paciente visitante.
router.post('/visitante', pacienteController.procesarVisitante); 

// Operaciones sobre un paciente identificado por su ID.
router.route('/:id') 
  .get( verificarToken, verificarRol('ODONTOLOGO', 'ADMIN'), pacienteController.obtenerPacientePorId)  
  .put( verificarToken, verificarRol('ODONTOLOGO', 'ADMIN'), pacienteController.actualizarPaciente)    
  .delete( verificarToken, verificarRol('ODONTOLOGO', 'ADMIN'), pacienteController.eliminarPaciente);  

export default router;