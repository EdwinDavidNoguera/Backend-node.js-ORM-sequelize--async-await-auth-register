import { Router } from "express";
import jwt from "jsonwebtoken";

import { citaController } from "../controllers/indexController.js";

import verificarToken from "../middlewares/verificarToken.js";
import verificarRol from "../middlewares/verificarRol.js";

const router = Router();

// =========================================================
// MIDDLEWARE OPCIONAL DE AUTENTICACIÓN
// =========================================================

/**
 * Permite realizar peticiones tanto autenticadas
 * como públicas.
 *
 * Si existe un JWT válido:
 *    req.usuario = usuario decodificado
 *
 * Si no existe o es inválido:
 *    req.usuario = null
 */
const tokenOpcional = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    req.usuario = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  if (
    !token ||
    token === "null" ||
    token === "undefined"
  ) {
    req.usuario = null;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRETA
    );

    req.usuario = decoded;
  } catch (error) {
    // Un token inválido no convierte la petición
    // en un error para esta ruta pública.
    req.usuario = null;
  }

  next();
};

// =========================================================
// RUTAS PÚBLICAS
// =========================================================

/**
 * Obtener disponibilidad de horarios.
 */
router.get(
  "/disponibilidad",
  citaController.obtenerDisponibilidad
);

/**
 * Verificar si un correo pertenece a un paciente
 * y si ese paciente tiene una cuenta.
 */
router.get(
  "/verificar-email",
  citaController.verificarEmail
);

/**
 * Crear cita.
 *
 * Puede ser:
 * - invitado
 * - paciente autenticado
 * - administrador
 * - odontólogo
 */
router.post(
  "/",
  tokenOpcional,
  citaController.crearCita
);

// =========================================================
// RUTAS PROTEGIDAS
// =========================================================

/**
 * Obtener todas las citas.
 */
router.get(
  "/",
  verificarToken,
  verificarRol("ADMIN"),
  citaController.obtenerCitas
);

/**
 * Obtener citas de un odontólogo.
 */
router.get(
  "/odontologo/:id_odontologo",
  verificarToken,
  verificarRol("ADMIN", "ODONTOLOGO"),
  citaController.obtenerCitasPorOdontologo
);

/**
 * Obtener citas de un paciente.
 */
router.get(
  "/paciente/:id_paciente",
  verificarToken,
  verificarRol(
    "ADMIN",
    "PACIENTE",
    "ODONTOLOGO"
  ),
  citaController.obtenerCitasPorPaciente
);

/**
 * Obtener una cita específica.
 */
router.get(
  "/:id",
  verificarToken,
  verificarRol(
    "ADMIN",
    "ODONTOLOGO",
    "PACIENTE"
  ),
  citaController.obtenerCitaPorId
);

/**
 * Actualizar una cita.
 */
router.put(
  "/:id",
  verificarToken,
  verificarRol(
    "ADMIN",
    "ODONTOLOGO",
    "PACIENTE"
  ),
  citaController.actualizarCita
);

/**
 * Cancelar una cita.
 */
router.put(
  "/:id/cancelar",
  verificarToken,
  verificarRol(
    "ADMIN",
    "ODONTOLOGO",
    "PACIENTE"
  ),
  citaController.cancelarCita
);

export default router;