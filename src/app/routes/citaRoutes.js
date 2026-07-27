import { Router } from "express";
import { citaController } from "../controllers/indexController.js";
import verificarToken from "../middlewares/verificarToken.js";
import verificarRol from "../middlewares/verificarRol.js";

const router = Router();

// Todas las rutas de citas requieren estar autenticado.
router.use(verificarToken);

router
  .route("/")
  .post(verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), citaController.crearCita)
  .get(verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), citaController.obtenerCitas);

// 🩺 Citas específicas por Odontólogo
router
  .route("/odontologo/:id_odontologo")
  .get(verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), citaController.obtenerCitasPorOdontologo);

// 👤 Citas específicas por Paciente
router
  .route("/paciente/:id_paciente")
  .get(verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), citaController.obtenerCitasPorPaciente);

router
  .route("/:id")
  .get(verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), citaController.obtenerCitaPorId)
  .put(verificarRol("ADMIN", "ODONTOLOGO"), citaController.actualizarCita);

router
  .route("/:id/cancelar")
  .put(verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"), citaController.cancelarCita);

export default router;