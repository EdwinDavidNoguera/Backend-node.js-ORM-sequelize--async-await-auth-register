// src/app/routes/serviciosRoutes.js
import express from "express";
import ServicioController from "../controllers/servicioController.js";
import verificarRol from "../middlewares/verificarRol.js";
import verificarToken from "../middlewares/verificarToken.js";

const router = express.Router();

// Rutas para /servicios
router.route("/")
  .get(verificarToken, verificarRol("admin", "odontologo", "paciente"),ServicioController.obtenerServicios) // Obtener todos los servicios
  .post( verificarToken, verificarRol("admin"),ServicioController.crearServicio); // Crear un nuevo servicio

// Rutas para servicios/:id
router
  .route("/:id")
  .get(verificarToken, verificarRol("admin", "odontologo", "paciente"), ServicioController.obtenerServicioPorId) // Obtener servicio por ID
  .put(verificarToken, verificarRol("admin"), ServicioController.actualizarServicio) // Actualizar servicio por ID
  .delete(verificarToken, verificarRol("admin"), ServicioController.eliminarServicio); // Eliminar servicio por ID

export default router;
