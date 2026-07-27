import { Op } from "sequelize";
import { Cita, Odontologo, Servicio, HorarioOdontologo } from "../models/indexModel.js";
import AppError from "../utils/errors/appError.js";
import {
  horaAMinutos,
  sumarMinutosAHora,
  obtenerDiaSemana,
  combinarFechaHora,
  seCruzanRangos,
} from "../utils/timeUtils.js";

class CitaService {
  
  // ==========================================
  // 🔒 MÉTODOS PRIVADOS DE VALIDACIÓN
  // ==========================================

  static async _obtenerOdontologoOrFail(id_odontologo) {
    const odontologo = await Odontologo.findByPk(id_odontologo);
    if (!odontologo) {
      throw new AppError("El odontólogo indicado no existe.", 404);
    }
    return odontologo;
  }

  static async _obtenerServicioOrFail(id_servicio) {
    const servicio = await Servicio.findByPk(id_servicio);
    if (!servicio) {
      throw new AppError("El servicio indicado no existe.", 404);
    }
    if (!servicio.activo) {
      throw new AppError("El servicio indicado no está activo.", 400);
    }
    return servicio;
  }

  static async _validarDentroDeTurno(id_odontologo, fecha, hora, hora_fin) {
    const diaSemana = obtenerDiaSemana(fecha);

    const turnos = await HorarioOdontologo.findAll({
      where: { id_odontologo, dia_semana: diaSemana },
    });

    if (turnos.length === 0) {
      throw new AppError(
        `El odontólogo no tiene turno de atención configurado para el día ${diaSemana.toLowerCase()}.`,
        400
      );
    }

    const inicioCitaMin = horaAMinutos(hora);
    const finCitaMin = horaAMinutos(hora_fin);

    const cabeEnAlgunTurno = turnos.some((turno) => {
      const inicioTurnoMin = horaAMinutos(turno.hora_inicio);
      const finTurnoMin = horaAMinutos(turno.hora_fin);
      return inicioCitaMin >= inicioTurnoMin && finCitaMin <= finTurnoMin;
    });

    if (!cabeEnAlgunTurno) {
      throw new AppError(
        "El horario solicitado está fuera del turno de atención del odontólogo.",
        400
      );
    }
  }

  static async _validarSinCruces(id_odontologo, fecha, hora, hora_fin, idCitaExcluir = null) {
    const where = {
      id_odontologo,
      fecha,
      estado: { [Op.in]: ["PROGRAMADA", "ATENDIDA"] },
    };
    if (idCitaExcluir) {
      where.id = { [Op.ne]: idCitaExcluir };
    }

    const citasDelDia = await Cita.findAll({ where });

    const inicioMin = horaAMinutos(hora);
    const finMin = horaAMinutos(hora_fin);

    const hayCruce = citasDelDia.some((citaExistente) =>
      seCruzanRangos(
        inicioMin,
        finMin,
        horaAMinutos(citaExistente.hora),
        horaAMinutos(citaExistente.hora_fin)
      )
    );

    if (hayCruce) {
      throw new AppError(
        "El odontólogo ya tiene otra cita PROGRAMADA o ATENDIDA que se cruza con este horario.",
        409
      );
    }
  }

  static async _validarYCalcularCita({ id_odontologo, id_servicio, fecha, hora, idCitaExcluir = null }) {
    await this._obtenerOdontologoOrFail(id_odontologo);
    const servicio = await this._obtenerServicioOrFail(id_servicio);

    // 1. No permitir fechas/horas en el pasado.
    const fechaHoraCita = combinarFechaHora(fecha, hora);
    if (fechaHoraCita.getTime() < Date.now()) {
      throw new AppError("No se pueden agendar citas en el pasado.", 400);
    }

    // 2. Calcular hora_fin automáticamente según duración del servicio.
    const hora_fin = sumarMinutosAHora(hora, servicio.duracion_minutos);

    // 3. La cita debe caber dentro del turno de trabajo del doctor.
    await this._validarDentroDeTurno(id_odontologo, fecha, hora, hora_fin);

    // 4. No debe cruzarse con otra cita PROGRAMADA/ATENDIDA del mismo doctor.
    await this._validarSinCruces(id_odontologo, fecha, hora, hora_fin, idCitaExcluir);

    return hora_fin;
  }

  // ==========================================
  // 🚀 MÉTODOS PÚBLICOS DEL SERVICIO
  // ==========================================

  static async crearCita(datos) {
    const { id_paciente, id_odontologo, id_servicio, fecha, hora } = datos;

    if (!id_odontologo || !id_servicio || !fecha || !hora) {
      throw new AppError(
        "id_odontologo, id_servicio, fecha y hora son obligatorios.",
        400
      );
    }

    const hora_fin = await this._validarYCalcularCita({
      id_odontologo,
      id_servicio,
      fecha,
      hora,
    });

    const nuevaCita = await Cita.create({
      id_paciente: id_paciente ?? null,
      id_odontologo,
      id_servicio,
      fecha,
      hora,
      hora_fin,
      estado: "PROGRAMADA",
    });

    return nuevaCita;
  }

  static async obtenerCitas(filtros = {}) {
    const where = {};

    if (filtros.id_paciente) where.id_paciente = filtros.id_paciente;
    if (filtros.id_odontologo) where.id_odontologo = filtros.id_odontologo;
    if (filtros.id_servicio) where.id_servicio = filtros.id_servicio;
    if (filtros.estado) where.estado = filtros.estado;

    if (filtros.fecha) {
      where.fecha = filtros.fecha;
    } else if (filtros.fecha_desde || filtros.fecha_hasta) {
      where.fecha = {};
      if (filtros.fecha_desde) where.fecha[Op.gte] = filtros.fecha_desde;
      if (filtros.fecha_hasta) where.fecha[Op.lte] = filtros.fecha_hasta;
    }

    return Cita.findAll({
      where,
      include: [
        { association: "paciente" },
        { association: "odontologo" },
        { association: "servicio" },
      ],
      order: [
        ["fecha", "ASC"],
        ["hora", "ASC"],
      ],
    });
  }

  static async obtenerCitaPorId(id) {
    const cita = await Cita.findByPk(id, {
      include: [
        { association: "paciente" },
        { association: "odontologo" },
        { association: "servicio" },
        { association: "historia" },
      ],
    });

    if (!cita) {
      throw new AppError("La cita solicitada no existe.", 404);
    }

    return cita;
  }

  //===obtener cita por id de odontologo==//
  static async obtenerCitasPorOdontologo(id_odontologo, filtros = {}) {
    await this._obtenerOdontologoOrFail(id_odontologo);

    const where = { id_odontologo };

    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.fecha) {
      where.fecha = filtros.fecha;
    } else if (filtros.fecha_desde || filtros.fecha_hasta) {
      where.fecha = {};
      if (filtros.fecha_desde) where.fecha[Op.gte] = filtros.fecha_desde;
      if (filtros.fecha_hasta) where.fecha[Op.lte] = filtros.fecha_hasta;
    }

    return Cita.findAll({
      where,
      include: [
        { association: "paciente" },
        { association: "servicio" },
        { association: "historia" },
      ],
      order: [
        ["fecha", "ASC"],
        ["hora", "ASC"],
      ],
    });
  }

  //===obtener cita por id de paciente==//
  static async obtenerCitasPorPaciente(id_paciente, filtros = {}) {
    const where = { id_paciente };

    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.fecha) {
      where.fecha = filtros.fecha;
    } else if (filtros.fecha_desde || filtros.fecha_hasta) {
      where.fecha = {};
      if (filtros.fecha_desde) where.fecha[Op.gte] = filtros.fecha_desde;
      if (filtros.fecha_hasta) where.fecha[Op.lte] = filtros.fecha_hasta;
    }

    return Cita.findAll({
      where,
      include: [
        { association: "odontologo" },
        { association: "servicio" },
        { association: "historia" },
      ],
      order: [
        ["fecha", "ASC"],
        ["hora", "ASC"],
      ],
    });
  }

  static async actualizarCita(id, datos) {
    const cita = await Cita.findByPk(id);
    if (!cita) {
      throw new AppError("La cita solicitada no existe.", 404);
    }

    if (cita.estado === "CANCELADA") {
      throw new AppError("No se puede reprogramar una cita CANCELADA.", 400);
    }
    if (cita.estado === "ATENDIDA") {
      throw new AppError("No se puede reprogramar una cita ya ATENDIDA.", 400);
    }

    const id_odontologo = datos.id_odontologo ?? cita.id_odontologo;
    const id_servicio = datos.id_servicio ?? cita.id_servicio;
    const fecha = datos.fecha ?? cita.fecha;
    const hora = datos.hora ?? cita.hora;

    const hora_fin = await this._validarYCalcularCita({
      id_odontologo,
      id_servicio,
      fecha,
      hora,
      idCitaExcluir: cita.id,
    });

    cita.id_paciente = datos.id_paciente ?? cita.id_paciente;
    cita.id_odontologo = id_odontologo;
    cita.id_servicio = id_servicio;
    cita.fecha = fecha;
    cita.hora = hora;
    cita.hora_fin = hora_fin;

    await cita.save();
    return cita;
  }

  static async cancelarCita(id) {
    const cita = await Cita.findByPk(id);
    if (!cita) {
      throw new AppError("La cita solicitada no existe.", 404);
    }

    if (cita.estado === "ATENDIDA") {
      throw new AppError("No se puede cancelar una cita ya ATENDIDA.", 400);
    }
    if (cita.estado === "CANCELADA") {
      throw new AppError("La cita ya se encuentra CANCELADA.", 400);
    }

    cita.estado = "CANCELADA";
    await cita.save();
    return cita;
  }
}

export default CitaService;