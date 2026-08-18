import express from 'express';
// Exportado desde el index central para controladores
import {pacienteController} from '../controllers/indexController.js'; 
const router = express.Router();
import verificarRol from '../middlewares/verificarRol.js';
import verificarToken from '../middlewares/verificarToken.js';

// ==========================================
// 1. RUTAS PARA LA RAÍZ: /api/pacientes/
// ==========================================
router.route('/')
  .get( verificarToken, verificarRol('ODONTOLOGO', 'ADMIN'), pacienteController.obtenerPacientes)   
  .post(pacienteController.registrarPacienteConUsuario);

// ==========================================
// 2. RUTA INDEPENDIENTE: /api/pacientes/visitante
// ==========================================
router.post('/visitante', pacienteController.procesarVisitante); 

// ==========================================
// 3. RUTAS PARAMETRIZADAS: /api/pacientes/:id
// ==========================================
router.route('/:id') 
  .get( verificarToken, verificarRol('ODONTOLOGO', 'ADMIN'), pacienteController.obtenerPacientePorId)  
  .put( verificarToken, verificarRol('ODONTOLOGO', 'ADMIN'), pacienteController.actualizarPaciente)    
  .delete( verificarToken, verificarRol('ODONTOLOGO', 'ADMIN'), pacienteController.eliminarPaciente);  

export default router;