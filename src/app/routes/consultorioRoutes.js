// src/app/routes/consultorioRoutes.js
import express from "express";
import {consultorioController} from "../controllers/indexController.js";
import verificarRol from "../middlewares/verificarRol.js";
import verificarToken from "../middlewares/verificarToken.js";

const router = express.Router();

// Rutas para /consultorios http://localhost:3500/consultorios
router.route("/")
  .get(verificarToken, verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), consultorioController.obtenerTodosConsultorios) // Todos pueden ver
  .post(verificarToken, verificarRol("ADMIN"), consultorioController.crearConsultorio); // Solo admin puede crear

// Rutas para /consultorios/:id
router.route("/:id")
  .get(verificarToken, verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), consultorioController.obtenerConsultorioPorId) // Todos pueden ver el detalle
  .put(verificarToken, verificarRol("ADMIN"), consultorioController.actualizarConsultorio) // Solo admin puede actualizar
  .delete(verificarToken, verificarRol("ADMIN"), consultorioController.eliminarConsultorio); // Solo admin puede eliminar

export default router;