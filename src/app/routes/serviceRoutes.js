// src/app/routes/serviciosRoutes.js
import express from "express";
import ServicioController from "../controllers/servicioController.js";
import verificarRol from "../middlewares/verificarRol.js";
import verificarToken from "../middlewares/verificarToken.js";

const router = express.Router();

// Rutas para /servicios
router.route("/")
  .get(verificarToken, verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"),ServicioController.obtenerTodosServicios) // Obtener todos los servicios
  .post( verificarToken, verificarRol("ADMIN"),ServicioController.crearServivicio); // Crear un nuevo servicio

// Rutas para servicios/:id
router
  .route("/:id")
  .get(verificarToken, verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), ServicioController.obtenerServicioPorId) // Obtener servicio por ID
  .put(verificarToken, verificarRol("ADMIN"), ServicioController.actualizarServicio) // Actualizar servicio por ID
  .delete(verificarToken, verificarRol("ADMIN"), ServicioController.eliminarServicio); // Eliminar servicio por ID

export default router;
