// Importamos Express para poder usar su sistema de enrutamiento
import express from 'express';

// Importamos el controlador que maneja la lógica de autenticación
import authController from '../controllers/authController.js';

// Creamos una instancia del enrutador de Express
const router = express.Router();

// Definimos una ruta POST en la raíz ('/') que ejecuta la función login del controlador de autenticación
router.post('/', authController.login);

// Exportamos el enrutador para poder utilizarlo en otros archivos del proyecto
export default router;
