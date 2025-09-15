import express from 'express'
import { historialPDFController } from "../controllers/indexController.js";
import verificarToken from '../middlewares/verificarToken.js';

const router = express.Router();
// Para pacientes (no envían id)
router.get('/descargar', verificarToken, historialPDFController.descargarHistorial);

// Para admin/odontólogo (envían id)
router.get('/descargar/:pacienteId', verificarToken, historialPDFController.descargarHistorial);

export default router;