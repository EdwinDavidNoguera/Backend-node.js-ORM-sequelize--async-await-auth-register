import catchAsync from "../utils/errors/catchAsync.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";
import HistorialService from "../services/historialService.js";
import generarHistorialPDF from "../utils/generarHistorialPDF.js";

/**
 * =========================================================
 * LIMPIAR NOMBRE PARA ARCHIVO PDF
 * =========================================================
 *
 * Elimina tildes, ñ y caracteres especiales para evitar
 * problemas en el header Content-Disposition.
 *
 * Ejemplo:
 * "María José Pérez" → "maria-jose-perez"
 */

function limpiarNombreArchivo(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

class HistorialController {
  // =========================================================
  // CREAR HISTORIAL
  // =========================================================

  static crearHistorial = catchAsync(async (req, res) => {
    const nuevoHistorial = await HistorialService.crearHistorial(
      req.body,
      req.usuario
    );

    enviarRespuestaExitosa(
      res,
      201,
      "Historial clínico creado correctamente",
      nuevoHistorial
    );
  });

  // =========================================================
  // OBTENER HISTORIAL POR PACIENTE
  // =========================================================

  static obtenerHistorialPorPaciente = catchAsync(async (req, res) => {
    const historial = await HistorialService.obtenerHistorialPorPaciente(
      req.params.id_paciente,
      req.usuario
    );

    const mensaje =
      historial.length > 0
        ? "Historial clínico del paciente obtenido con éxito"
        : "No se encontró historial clínico para el paciente especificado";

    enviarRespuestaExitosa(res, 200, mensaje, historial);
  });

  // =========================================================
  // OBTENER HISTORIAL POR ID
  // =========================================================

  static obtenerHistorialPorId = catchAsync(async (req, res) => {
    const historial = await HistorialService.obtenerHistorialPorId(
      req.params.id,
      req.usuario
    );

    enviarRespuestaExitosa(
      res,
      200,
      "Historial clínico obtenido con éxito",
      historial
    );
  });

  // =========================================================
  // ACTUALIZAR HISTORIAL
  // =========================================================

  static actualizarHistorial = catchAsync(async (req, res) => {
    const historialActualizado =
      await HistorialService.actualizarHistorial(
        req.params.id,
        req.body,
        req.usuario
      );

    enviarRespuestaExitosa(
      res,
      200,
      "Historial clínico actualizado correctamente",
      historialActualizado
    );
  });

  // =========================================================
  // DESCARGAR HISTORIAL CLÍNICO EN PDF
  // =========================================================

  /**
   * Genera y descarga el historial clínico completo
   * de un paciente en formato PDF.
   *
   * IMPORTANTE:
   * Esta respuesta no utiliza enviarRespuestaExitosa()
   * porque no estamos enviando JSON.
   *
   * Flujo:
   *
   * Controller
   *     ↓
   * HistorialService
   *     ↓
   * Validación de permisos + datos
   *     ↓
   * generarHistorialPDF()
   *     ↓
   * PDFDocument
   *     ↓
   * res
   */

  static descargarHistorialPDF = catchAsync(async (req, res) => {
    // -------------------------------------------------------
    // OBTENER DATOS Y VALIDAR PERMISOS
    // -------------------------------------------------------

    const { paciente, atenciones } =
      await HistorialService.obtenerDatosHistorialParaPDF(
        req.params.id_paciente,
        req.usuario
      );

    // -------------------------------------------------------
    // GENERAR DOCUMENTO PDF
    // -------------------------------------------------------

    const doc = generarHistorialPDF({
      paciente,
      atenciones,
    });

    // -------------------------------------------------------
    // CONSTRUIR NOMBRE DEL ARCHIVO
    // -------------------------------------------------------

    const nombreCompleto =
      `${paciente.nombre ?? ""} ${paciente.apellido ?? ""}`.trim();

    const nombreLimpio = limpiarNombreArchivo(nombreCompleto);

    const nombreArchivo =
      `historial-clinico-${nombreLimpio || paciente.id}.pdf`;

    // -------------------------------------------------------
    // HEADERS HTTP
    // -------------------------------------------------------

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nombreArchivo}"`
    );

    // -------------------------------------------------------
    // ENVIAR PDF AL CLIENTE
    // -------------------------------------------------------

    doc.pipe(res);

    doc.end();
  });
}

export default HistorialController;

