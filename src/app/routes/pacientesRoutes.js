import express from 'express';
import PacienteController from '../controllers/pacienteController.js';
const router = express.Router();

// Rutas para /api/pacientes/
router.route('/')
  .get(PacienteController.obtenerPacientes)   // Obtener todos los pacientes
  .post(PacienteController.crearPaciente);    // Crear un nuevo paciente

// Rutas para /api/pacientes/:id
router.route('/:id')
  .get(PacienteController.obtenerPacientePorId)  // Obtener un paciente por ID
  .put(PacienteController.actualizarPaciente)    // Actualizar paciente por ID
  .delete(PacienteController.eliminarPaciente);  // Eliminar paciente por ID

 export default router;
