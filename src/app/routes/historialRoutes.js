import { Router } from "express";
import {historialController} from "../controllers/indexController.js";
import { verificarToken, verificarRol } from "../middlewares/auth.js";

const router = Router();

router.use(verificarToken);

// Solo el odontólogo (o un admin) registra historial clínico.
router
  .route("/")
  .post(verificarRol(["ADMIN", "ODONTOLOGO"]), historialController.crearHistorial);

// El paciente puede ver su propio historial; admin/odontólogo también.
router
  .route("/paciente/:id_paciente")
  .get(
    verificarRol(["ADMIN", "ODONTOLOGO", "PACIENTE"]),
    historialController.obtenerHistorialPorPaciente
  );

router
  .route("/:id")
  .get(
    verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"),
    historialController.obtenerHistorialPorId
  )
  // Actualizar notas: restringido a ADMIN/ODONTOLOGO (ver nota en
  // historialService.js sobre la restricción adicional por tiempo).
  .put(verificarRol("ADMIN", "ODONTOLOGO"), historialController.actualizarHistorial);

export default router;
