// src/app/routes/serviciosRoutes.js
import express from "express";
import {servicioController} from "../controllers/indexController.js";
import verificarRol from "../middlewares/verificarRol.js";
import verificarToken from "../middlewares/verificarToken.js";

const router = express.Router();

// Rutas para /servicios http://localhost:3500/servicios
router.route("/")
  .get(servicioController.obtenerTodosServicios) // Obtener todos los servicios publico
  .post( verificarToken, verificarRol("ADMIN"), servicioController.crearServicio); // Crear un nuevo servicio

// Rutas para servicios/:id
router
  .route("/:id")
  .get(verificarToken, verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), servicioController.obtenerServicioPorId) // Obtener servicio por ID
  .put(verificarToken, verificarRol("ADMIN"), servicioController.actualizarServicio) // Actualizar servicio por ID
  .delete(verificarToken, verificarRol("ADMIN"), servicioController.eliminarServicio); // Eliminar servicio por ID

export default router;
