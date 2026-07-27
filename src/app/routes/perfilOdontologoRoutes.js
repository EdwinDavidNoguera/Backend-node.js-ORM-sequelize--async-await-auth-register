// src/app/routes/perfilOdontologoRoutes.js
import express from "express";
import {perfilController} from "../controllers/indexController.js";
import verificarRol from "../middlewares/verificarRol.js";
import verificarToken from "../middlewares/verificarToken.js";

const router = express.Router();

// Rutas base para /perfiles-odontologos http://localhost:3500/perfiles-odontologos
router.route("/")
  .post(verificarToken, verificarRol("ADMIN", "ODONTOLOGO"), perfilController.crearPerfil);

// Búsqueda específica por el ID del odontólogo (muy útil para el frontend al ver un doctor específico)
router.route("/odontologo/:id_odontologo")
  .get(verificarToken, verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), perfilController.obtenerPerfilPorOdontologo);

// Mantenimiento de un perfil específico por el ID de la tabla `perfil_odontologo`
router.route("/:id")
  .put(verificarToken, verificarRol("ADMIN", "ODONTOLOGO"), perfilController.actualizarPerfil)
  .delete(verificarToken, verificarRol("ADMIN"), perfilController.eliminarPerfil);

export default router;