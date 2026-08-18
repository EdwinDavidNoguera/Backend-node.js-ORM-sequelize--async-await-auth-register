// src/app/routes/serviciosRoutes.js
import express from "express";
import {servicioController} from "../controllers/indexController.js";
import verificarRol from "../middlewares/verificarRol.js";
import verificarToken from "../middlewares/verificarToken.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

/*Rutas para /servicios http://localhost:3500/servicios
usamos los 3 middlewares: verificarToken, verificarRol y upload.single("img") para proteger la ruta de creación de servicios y permitir la carga de imágenes.*/

router.route("/")
  .get(servicioController.obtenerTodosServicios) // Obtener todos los servicios publico
  .post( verificarToken, verificarRol("ADMIN"), upload.single("img"),
 servicioController.crearServicio); // Crear un nuevo servicio

// Rutas para servicios/:id
router
  .route("/:id")
  .get(verificarToken, verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), servicioController.obtenerServicioPorId) // Obtener servicio por ID
  .put(verificarToken, verificarRol("ADMIN"), upload.single("img"), servicioController.actualizarServicio) // Actualizar servicio por ID
  .delete(verificarToken, verificarRol("ADMIN"), servicioController.eliminarServicio); // Eliminar servicio por ID

export default router;
