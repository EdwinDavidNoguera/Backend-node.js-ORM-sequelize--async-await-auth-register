import express from "express";
import { odontologoController } from "../controllers/indexController.js";

import verificarRol from "../middlewares/verificarRol.js";
import verificarToken from "../middlewares/verificarToken.js";

import uploadPerfilOdontologo from "../middlewares/uploadPerfilOdontologo.js";

const router = express.Router();

// Rutas para /odontologos.

router.route("/")

  // Obtiene todos los odontólogos.
  .get(
    odontologoController.obtenerOdontologos
  )

  // Crea un odontólogo y procesa una imagen opcional en el campo img.
  .post(
    verificarToken,
    verificarRol("ADMIN"),
    uploadPerfilOdontologo.single("img"),
    odontologoController.crearOdontologo
  );


// Rutas para /odontologos/:id.

router.route("/:id")

  // Obtiene un odontólogo por ID.
  .get(
    odontologoController.obtenerOdontologoPorId
  )

  // Actualiza un odontólogo por ID.
  .put(
    verificarToken,
    verificarRol("ADMIN", "ODONTOLOGO"),
    uploadPerfilOdontologo.single("img"),
    odontologoController.actualizarOdontologo
  )

  // Elimina un odontólogo por ID.
  .delete(
    verificarToken,
    verificarRol("ADMIN"),
    odontologoController.eliminarOdontologo
  );


export default router;