// src/app/routes/horarioOdontologoRoutes.js
import express from "express";
import {horarioOdontologoController} from "../controllers/indexController.js";
import verificarRol from "../middlewares/verificarRol.js";
import verificarToken from "../middlewares/verificarToken.js";

const router = express.Router();

// Rutas para /horarios http://localhost:3500/horarios
router.route("/")
  .post(verificarToken, verificarRol("ADMIN", "ODONTOLOGO"), horarioOdontologoController.crearHorario); // Crear un bloque de horario

// Rutas para /horarios/odontologo/:id_odontologo
router.route("/odontologo/:id_odontologo")
  .get(verificarToken, verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), horarioOdontologoController.obtenerHorario); // Ver horarios de un odontólogo

// Rutas para /horarios/:id
router.route("/:id")
  .delete(verificarToken, verificarRol("ADMIN", "ODONTOLOGO"), horarioOdontologoController.eliminarHorario); // Eliminar un bloque de horario

export default router;