import { Router } from "express";

import { citaController } from "../controllers/indexController.js";

import verificarToken from "../middlewares/verificarToken.js";
import verificarRol from "../middlewares/verificarRol.js";


const router = Router();


// =========================================================
// TODAS LAS RUTAS DE CITAS REQUIEREN AUTENTICACIÓN
// =========================================================

router.use(verificarToken);


// =========================================================
// CITAS
// =========================================================

// Crear cita
//
// ADMIN
// ODONTOLOGO
// PACIENTE

router.post("/",
  verificarRol("ADMIN","ODONTOLOGO","PACIENTE"), citaController.crearCita
);


// Obtener todas las citas
//
// Solamente ADMIN.
// El frontend de pacientes y odontólogos
// utilizará las rutas específicas.

router.get("/", verificarRol("ADMIN"), citaController.obtenerCitas
);


// =========================================================
// CITAS POR ODONTÓLOGO
// =========================================================

// ADMIN:
// puede consultar cualquier odontólogo.
//
// ODONTOLOGO:
// solamente puede consultar sus propias citas.
//
// El servicio verifica la propiedad.

router.get(
  "/odontologo/:id_odontologo",
  verificarRol(
    "ADMIN",
    "ODONTOLOGO"
  ),
  citaController.obtenerCitasPorOdontologo
);


// =========================================================
// CITAS POR PACIENTE
// =========================================================

// ADMIN:
// puede consultar cualquier paciente.
//
// PACIENTE:
// solamente puede consultar sus propias citas.
//
// El servicio verifica la propiedad.

router.get("/paciente/:id_paciente", verificarRol("ADMIN", "PACIENTE", "ODONTOLOGO"), citaController.obtenerCitasPorPaciente
);


// =========================================================
// CITA POR ID
// =========================================================

// ADMIN:
// cualquier cita.
//
// ODONTOLOGO:
// solamente sus citas.
//
// PACIENTE:
// solamente sus citas.
//
// El servicio realiza la comprobación.

router.get(
  "/:id",
  verificarRol(
    "ADMIN",
    "ODONTOLOGO",
    "PACIENTE"
  ),
  citaController.obtenerCitaPorId
);


// =========================================================
// ACTUALIZAR CITA
// =========================================================

// ADMIN
// ODONTOLOGO
// PACIENTE
//
// El servicio verifica que solamente
// puedan modificar una cita que les corresponde.

router.put(
  "/:id",
  verificarRol(
    "ADMIN",
    "ODONTOLOGO",
    "PACIENTE"
  ),
  citaController.actualizarCita
);


// =========================================================
// CANCELAR CITA
// =========================================================

// ADMIN
// ODONTOLOGO
// PACIENTE
//
// El servicio verifica la propiedad.

router.put(
  "/:id/cancelar",
  verificarRol(
    "ADMIN",
    "ODONTOLOGO",
    "PACIENTE"
  ),
  citaController.cancelarCita
);


export default router;