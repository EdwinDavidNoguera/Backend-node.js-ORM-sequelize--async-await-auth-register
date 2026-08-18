import { Router } from "express";
import historialController from "../controllers/historialController.js";
import verificarToken from "../middlewares/verificarToken.js";
import verificarRol from "../middlewares/verificarRol.js";

const router = Router();

// Todas las rutas de historial requieren autenticación.
router.use(verificarToken);

// =========================================================
// CREAR HISTORIAL CLÍNICO
// =========================================================
//
// ADMIN y ODONTOLOGO pueden crear historias.
// El paciente no puede crear historias.

router
  .route("/")
  .post(
    verificarRol("ADMIN", "ODONTOLOGO"),
    historialController.crearHistorial
  );

// =========================================================
// OBTENER HISTORIAL DE UN PACIENTE
// =========================================================
//
// ADMIN y ODONTOLOGO pueden consultar cualquier paciente.
// PACIENTE puede consultar únicamente el suyo.
// La validación de pertenencia del paciente se realiza
// dentro del HistorialService.

router
  .route("/paciente/:id_paciente")
  .get(
    verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"),
    historialController.obtenerHistorialPorPaciente
  );

// =========================================================
// DESCARGAR HISTORIAL CLÍNICO EN PDF
// =========================================================
//
// ADMIN y ODONTOLOGO pueden descargar el historial
// de cualquier paciente.
// PACIENTE solamente puede descargar el suyo.
//
// La validación de pertenencia se realiza dentro
// del HistorialService.

router
  .route("/paciente/:id_paciente/pdf")
  .get(
    verificarRol("ADMIN", "ODONTOLOGO", "PACIENTE"),
    historialController.descargarHistorialPDF
  );

// =========================================================
// OBTENER HISTORIAL POR ID
// =========================================================
//
// ADMIN y ODONTOLOGO pueden consultar historias.
// PACIENTE no puede consultar directamente una historia
// individual por ID.

router
  .route("/:id")
  .get(
    verificarRol("ADMIN", "ODONTOLOGO"),
    historialController.obtenerHistorialPorId
  );

// =========================================================
// ACTUALIZAR HISTORIAL
// =========================================================
//
// ADMIN puede actualizar cualquier historia.
// ODONTOLOGO puede actualizar historias de sus propias citas.
// PACIENTE no puede actualizar historias.
//
// La validación específica del odontólogo se realiza
// dentro del HistorialService.

router
  .route("/:id")
  .put(
    verificarRol("ADMIN", "ODONTOLOGO"),
    historialController.actualizarHistorial
  );

export default router;

