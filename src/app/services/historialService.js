import { Cita, HistoriaOdontologica } from "../models/indexModel.js";
import AppError from "../utils/errors/appError.js";

/**
 * NOTA SOBRE EL ESQUEMA:
 * La tabla física `historia_odontologica` NO duplica id_paciente ni id_odontologo.
 * Se derivan siempre de la `cita` asociada como fuente de verdad.
 */

const LIMITE_EDICION_MS = 1000 * 60 * 60 * 48; // 48 horas (Punto de extensión futuro)

const incluirCitaConDetalle = {
  association: "cita",
  include: [
    { association: "paciente" },
    { association: "odontologo" },
    { association: "servicio" },
  ],
};

class HistorialService {

  /**
   * Crea un historial clínico y marca automáticamente la cita como ATENDIDA.
   */
  static async crearHistorial(datos) {
    const {
      id_cita,
      motivo_consulta,
      diagnostico,
      tratamiento_realizado,
      medicamentos_recetados,
      observaciones,
    } = datos;

    if (!id_cita || !diagnostico || !tratamiento_realizado) {
      throw new AppError(
        "id_cita, diagnostico y tratamiento_realizado son obligatorios.",
        400
      );
    }

    const cita = await Cita.findByPk(id_cita);
    if (!cita) {
      throw new AppError("La cita indicada no existe.", 404);
    }

    if (cita.estado === "CANCELADA") {
      throw new AppError(
        "No se puede registrar historial clínico sobre una cita CANCELADA.",
        400
      );
    }

    const historialExistente = await HistoriaOdontologica.findOne({
      where: { id_cita },
    });
    if (historialExistente) {
      throw new AppError(
        "Esta cita ya tiene un registro de historial clínico asociado.",
        409
      );
    }

    const nuevoHistorial = await HistoriaOdontologica.create({
      id_cita,
      motivo_consulta: motivo_consulta ?? null,
      diagnostico,
      tratamiento_realizado,
      medicamentos_recetados: medicamentos_recetados ?? null,
      observaciones: observaciones ?? null,
    });

    // Regla de negocio automatizada: registrar el historial marca la cita como ATENDIDA
    if (cita.estado !== "ATENDIDA") {
      cita.estado = "ATENDIDA";
      await cita.save();
    }

    return HistoriaOdontologica.findByPk(nuevoHistorial.id, {
      include: [incluirCitaConDetalle],
    });
  }

  /**
   * Historial completo de un paciente, ordenado cronológicamente por cita.
   */
  static async obtenerHistorialPorPaciente(id_paciente) {
    if (!id_paciente) {
      throw new AppError("id_paciente es obligatorio.", 400);
    }

    return HistoriaOdontologica.findAll({
      include: [
        {
          ...incluirCitaConDetalle,
          where: { id_paciente },
          required: true,
        },
      ],
      order: [
        [{ model: Cita, as: "cita" }, "fecha", "ASC"],
        [{ model: Cita, as: "cita" }, "hora", "ASC"],
      ],
    });
  }

  /**
   * Obtiene un registro de historial específico por su ID.
   */
  static async obtenerHistorialPorId(id) {
    const historial = await HistoriaOdontologica.findByPk(id, {
      include: [incluirCitaConDetalle],
    });

    if (!historial) {
      throw new AppError("El registro de historial solicitado no existe.", 404);
    }

    return historial;
  }

  /**
   * Actualiza notas clínicas de un historial existente.
   */
  static async actualizarHistorial(id, datos) {
    const historial = await HistoriaOdontologica.findByPk(id);
    if (!historial) {
      throw new AppError("El registro de historial solicitado no existe.", 404);
    }

    const camposEditables = [
      "motivo_consulta",
      "diagnostico",
      "tratamiento_realizado",
      "medicamentos_recetados",
      "observaciones",
    ];

    camposEditables.forEach((campo) => {
      if (datos[campo] !== undefined) {
        historial[campo] = datos[campo];
      }
    });

    await historial.save();
    return historial;
  }
}

export default HistorialService;