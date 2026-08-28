// Importa Express para definir las rutas de autenticación.
import express from 'express';

// Importa el controlador encargado de procesar la autenticación.
import authController from '../controllers/authController.js';

// Crea el enrutador de autenticación.
const router = express.Router();

// Registra el inicio de sesión en la ruta raíz del módulo.
router.post('/', authController.login);

// Exporta el enrutador para montarlo desde la configuración principal.
export default router;
