import express from "express";
import { odontologoController } from "../controllers/indexController.js";

import verificarRol from "../middlewares/verificarRol.js";
import verificarToken from "../middlewares/verificarToken.js";

import uploadPerfilOdontologo from "../middlewares/uploadPerfilOdontologo.js";

const router = express.Router();

// ==========================================
// RUTAS PARA /odontologos
// ==========================================

router.route("/")

  // Obtener todos los odontólogos
  .get(
    odontologoController.obtenerOdontologos
  )

  // Crear un nuevo odontólogo
  //
  // uploadPerfilOdontologo.single("img")
  // recibe una sola imagen desde el campo "img"
  .post(
    verificarToken,
    verificarRol("ADMIN"),
    uploadPerfilOdontologo.single("img"),
    odontologoController.crearOdontologo
  );


// ==========================================
// RUTAS PARA /odontologos/:id
// ==========================================

router.route("/:id")

  // Obtener odontólogo por ID
  .get(
    odontologoController.obtenerOdontologoPorId
  )

  // Actualizar odontólogo por ID
  .put(
    verificarToken,
    verificarRol("ADMIN", "ODONTOLOGO"),
    uploadPerfilOdontologo.single("img"),
    odontologoController.actualizarOdontologo
  )

  // Eliminar odontólogo por ID
  .delete(
    verificarToken,
    verificarRol("ADMIN"),
    odontologoController.eliminarOdontologo
  );


export default router;