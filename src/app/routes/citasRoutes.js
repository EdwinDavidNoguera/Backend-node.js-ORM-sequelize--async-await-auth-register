import express from 'express';
import CitasController from '../controllers/citasController.js'; // Asegúrate que el nombre coincida
import verificarRol from '../middlewares/verificarRol.js';
import verificarToken from '../middlewares/verificarToken.js';

const router = express.Router();

/**
 * =================================================================
 * RUTAS PARA CITAS
 * =================================================================
 */

// == ACCIONES PRINCIPALES ==

// [POST] /citas/ -> Crear una nueva cita.
// Solo los pacientes pueden crear citas. El controlador se encarga de asignarles la cita a ellos mismos.

// [GET] /citas/ -> Listar citas.
// Todos los roles pueden acceder, pero el controlador filtrará los resultados según el rol.
router.route('/')
  .post(verificarToken, verificarRol('paciente', 'admin'), CitasController.crearCita)
  .get(verificarToken, CitasController.listarCitas);

// [GET] /citas/:id -> Obtener una cita específica.
// El controlador verifica que el paciente/odontólogo sea el dueño de la cita.

// [PUT] /citas/:id -> Actualizar una cita existente.
// Solo el admin o el paciente dueño pueden modificar la cita.
router.route('/:id')
  .get(verificarToken, CitasController.obtenerCitaPorId)
  .put(verificarToken, verificarRol('paciente', 'admin'), CitasController.actualizarCita);

// == ACCIONES DE MODIFICACIÓN Y ESTADO ==

// [PATCH] /citas/:id/cancelar -> CANCELAR una cita (Soft Delete).
// Esta es la acción que debe usar un paciente. El controlador verifica que sea el dueño.
// Un admin también podría usarla.

router.route('/:id/cancelar')
  .patch(verificarToken, CitasController.cancelarCita)


// [DELETE] /api/citas/:id -> ELIMINAR una cita permanentemente (Hard Delete).
// ¡ACCIÓN PELIGROSA! Solo el administrador puede borrar registros de la base de datos.
router.delete(
  '/:id', verificarToken, verificarRol('admin'), // Middleware CRÍTICO para la seguridad
  CitasController.eliminarCitaDefinitivamente
);

// [PUT] /citas/:id -> Actualizar una cita existente.
// Solo el admin o el paciente dueño pueden modificar la cita.
router.put(
  '/:id',
  verificarToken,
  verificarRol('paciente', 'admin'),
  CitasController.actualizarCita
);

export default router;