import express from 'express';
import PacienteController from '../controllers/pacienteController.js';
const router = express.Router();
import verificarRol from '../middlewares/verificarRol.js';
import verificarToken from '../middlewares/verificarToken.js';

// Rutas para /api/pacientes/
router.route('/')
  .get(verificarToken, verificarRol('admin', 'odontologo'), PacienteController.obtenerPacientes)   // Obtener todos los pacientes
  .post(PacienteController.crearPaciente);    // Crear un nuevo paciente

// Rutas para /api/pacientes/:id
router.route('/:id')
  .get(verificarToken,  verificarRol('admin', 'odontologo'), PacienteController.obtenerPacientePorId)  // Obtener un paciente por ID
  .put(verificarToken,  verificarRol('admin', 'paciente'),PacienteController.actualizarPaciente)    // Actualizar paciente por ID
  .delete(verificarToken,  verificarRol('admin', 'odontologo', 'paciente'),PacienteController.eliminarPaciente);  // Eliminar paciente por ID

 export default router;
