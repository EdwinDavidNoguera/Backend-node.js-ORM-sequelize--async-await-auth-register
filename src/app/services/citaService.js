import { Op } from "sequelize";

import {
  Cita,
  Odontologo,
  Paciente,
  Servicio,
  HorarioOdontologo,
} from "../models/indexModel.js";

import AppError from "../utils/errors/appError.js";

import {
  horaAMinutos,
  sumarMinutosAHora,
  obtenerDiaSemana,
  combinarFechaHora,
  seCruzanRangos,
} from "../utils/timeUtils.js";


class CitaService {

  // =========================================================
  // MÉTODOS PRIVADOS DE VALIDACIÓN
  // =========================================================

  // ---------------------------------------------------------
  // Obtener odontólogo o lanzar error
  // ---------------------------------------------------------

  static async _obtenerOdontologoOrFail(id_odontologo) {

    const odontologo =
      await Odontologo.findByPk(id_odontologo);

    if (!odontologo) {

      throw new AppError(
        "El odontólogo indicado no existe.",
        404
      );
    }

    return odontologo;
  }


  // ---------------------------------------------------------
  // Obtener paciente o lanzar error
  // ---------------------------------------------------------

  static async _obtenerPacienteOrFail(id_paciente) {

    const paciente =
      await Paciente.findByPk(id_paciente);

    if (!paciente) {

      throw new AppError(
        "El paciente indicado no existe.",
        404
      );
    }

    return paciente;
  }


  // ---------------------------------------------------------
  // Obtener paciente asociado al usuario autenticado
  // ---------------------------------------------------------

  static async _obtenerPacienteDelUsuario(usuario) {

    const paciente =
      await Paciente.findOne({
        where: {
          id_usuario: usuario.id,
        },
      });


    if (!paciente) {

      throw new AppError(
        "No se encontró un paciente asociado al usuario autenticado.",
        404
      );
    }


    return paciente;
  }


  // ---------------------------------------------------------
  // Obtener servicio o lanzar error
  // ---------------------------------------------------------

  static async _obtenerServicioOrFail(id_servicio) {

    const servicio =
      await Servicio.findByPk(id_servicio);

    if (!servicio) {

      throw new AppError(
        "El servicio indicado no existe.",
        404
      );
    }

    if (!servicio.activo) {

      throw new AppError(
        "El servicio indicado no está activo.",
        400
      );
    }

    return servicio;
  }


  // =========================================================
  // VALIDAR PROPIEDAD DE PACIENTE
  // =========================================================

  static async _validarPacienteAutenticado(
    id_paciente,
    usuario
  ) {

    // ADMIN puede consultar cualquier paciente.

    if (usuario.rol === "ADMIN") {
      return;
    }


    // Solamente PACIENTE puede consultar
    // sus propias citas.

    if (usuario.rol !== "PACIENTE") {

      throw new AppError(
        "No tienes permisos para consultar citas de pacientes.",
        403
      );
    }


    const paciente =
      await this._obtenerPacienteOrFail(
        id_paciente
      );


    if (
      Number(paciente.id_usuario) !==
      Number(usuario.id)
    ) {

      throw new AppError(
        "No tienes permiso para consultar las citas de este paciente.",
        403
      );
    }
  }


  // =========================================================
  // VALIDAR PROPIEDAD DE ODONTÓLOGO
  // =========================================================

  static async _validarOdontologoAutenticado(
    id_odontologo,
    usuario
  ) {

    // ADMIN puede consultar cualquier odontólogo.

    if (usuario.rol === "ADMIN") {
      return;
    }


    // Solamente ODONTOLOGO puede consultar
    // sus propias citas.

    if (usuario.rol !== "ODONTOLOGO") {

      throw new AppError(
        "No tienes permisos para consultar citas de odontólogos.",
        403
      );
    }


    const odontologo =
      await this._obtenerOdontologoOrFail(
        id_odontologo
      );


    if (
      Number(odontologo.id_usuario) !==
      Number(usuario.id)
    ) {

      throw new AppError(
        "No tienes permiso para consultar las citas de este odontólogo.",
        403
      );
    }
  }


  // =========================================================
  // VALIDAR DENTRO DEL TURNO
  // =========================================================

  static async _validarDentroDeTurno(
    id_odontologo,
    fecha,
    hora,
    hora_fin
  ) {

    const diaSemana =
      obtenerDiaSemana(fecha);


    const turnos =
      await HorarioOdontologo.findAll({

        where: {
          id_odontologo,
          dia_semana: diaSemana,
        },

      });


    if (turnos.length === 0) {

      throw new AppError(
        `El odontólogo no tiene turno de atención configurado para el día ${diaSemana.toLowerCase()}.`,
        400
      );
    }


    const inicioCitaMin =
      horaAMinutos(hora);

    const finCitaMin =
      horaAMinutos(hora_fin);


    const cabeEnAlgunTurno =
      turnos.some((turno) => {

        const inicioTurnoMin =
          horaAMinutos(
            turno.hora_inicio
          );

        const finTurnoMin =
          horaAMinutos(
            turno.hora_fin
          );


        return (
          inicioCitaMin >= inicioTurnoMin &&
          finCitaMin <= finTurnoMin
        );

      });


    if (!cabeEnAlgunTurno) {

      throw new AppError(
        "El horario solicitado está fuera del turno de atención del odontólogo.",
        400
      );
    }
  }


  // =========================================================
  // VALIDAR CRUCES DE CITAS
  // =========================================================

  static async _validarSinCruces(
    id_odontologo,
    fecha,
    hora,
    hora_fin,
    idCitaExcluir = null
  ) {

    const where = {

      id_odontologo,

      fecha,

      estado: {
        [Op.in]: [
          "PROGRAMADA",
          "ATENDIDA",
        ],
      },

    };


    if (idCitaExcluir) {

      where.id = {
        [Op.ne]: idCitaExcluir,
      };

    }


    const citasDelDia =
      await Cita.findAll({
        where,
      });


    const inicioMin =
      horaAMinutos(hora);

    const finMin =
      horaAMinutos(hora_fin);


    const hayCruce =
      citasDelDia.some(
        (citaExistente) =>

          seCruzanRangos(

            inicioMin,
            finMin,

            horaAMinutos(
              citaExistente.hora
            ),

            horaAMinutos(
              citaExistente.hora_fin
            )

          )
      );


    if (hayCruce) {

      throw new AppError(
        "El odontólogo ya tiene otra cita PROGRAMADA o ATENDIDA que se cruza con este horario.",
        409
      );
    }
  }


  // =========================================================
  // VALIDACIÓN GENERAL DE CITA
  // =========================================================

  static async _validarYCalcularCita({

    id_odontologo,
    id_servicio,
    fecha,
    hora,
    idCitaExcluir = null,

  }) {

    await this._obtenerOdontologoOrFail(
      id_odontologo
    );


    const servicio =
      await this._obtenerServicioOrFail(
        id_servicio
      );


    const fechaHoraCita =
      combinarFechaHora(
        fecha,
        hora
      );


    if (
      fechaHoraCita.getTime() <
      Date.now()
    ) {

      throw new AppError(
        "No se pueden agendar citas en el pasado.",
        400
      );
    }


    const hora_fin =
      sumarMinutosAHora(
        hora,
        servicio.duracion_minutos
      );


    await this._validarDentroDeTurno(

      id_odontologo,
      fecha,
      hora,
      hora_fin

    );


    await this._validarSinCruces(

      id_odontologo,
      fecha,
      hora,
      hora_fin,
      idCitaExcluir

    );


    return hora_fin;
  }


  // =========================================================
  // CREAR CITA
  // =========================================================

  static async crearCita(
    datos,
    usuario
  ) {

    const {
      id_paciente,
      id_odontologo,
      id_servicio,
      fecha,
      hora,
    } = datos;


    // -------------------------------------------------------
    // VALIDAR CAMPOS OBLIGATORIOS
    // -------------------------------------------------------

    if (
      !id_odontologo ||
      !id_servicio ||
      !fecha ||
      !hora
    ) {

      throw new AppError(
        "id_odontologo, id_servicio, fecha y hora son obligatorios.",
        400
      );
    }


    // -------------------------------------------------------
    // DETERMINAR EL PACIENTE
    // -------------------------------------------------------

    let pacienteId =
      id_paciente ?? null;


    // Si el usuario autenticado es PACIENTE,
    // el backend determina automáticamente
    // cuál es su paciente.

    if (
      usuario.rol === "PACIENTE"
    ) {

      const paciente =
        await this._obtenerPacienteDelUsuario(
          usuario
        );


      pacienteId =
        paciente.id;
    }


    // -------------------------------------------------------
    // ADMIN
    // -------------------------------------------------------

    // Si ADMIN proporciona un paciente,
    // verificamos que exista.

    if (
      usuario.rol === "ADMIN" &&
      pacienteId
    ) {

      await this._obtenerPacienteOrFail(
        pacienteId
      );
    }


    // -------------------------------------------------------
    // ODONTÓLOGO
    // -------------------------------------------------------

    // Si un odontólogo proporciona un paciente,
    // verificamos que el paciente exista.

    if (
      usuario.rol === "ODONTOLOGO" &&
      pacienteId
    ) {

      await this._obtenerPacienteOrFail(
        pacienteId
      );
    }


    // -------------------------------------------------------
    // VALIDAR HORARIO Y DISPONIBILIDAD
    // -------------------------------------------------------

    const hora_fin =
      await this._validarYCalcularCita({

        id_odontologo,
        id_servicio,
        fecha,
        hora,

      });


    // -------------------------------------------------------
    // CREAR CITA
    // -------------------------------------------------------

    const nuevaCita =
      await Cita.create({

        id_paciente:
          pacienteId,

        id_odontologo,

        id_servicio,

        fecha,

        hora,

        hora_fin,

        estado:
          "PROGRAMADA",

      });


    return nuevaCita;
  }


  // =========================================================
  // OBTENER TODAS LAS CITAS
  // =========================================================

  static async obtenerCitas(
    filtros = {}
  ) {

    const where = {};


    if (filtros.id_paciente) {

      where.id_paciente =
        filtros.id_paciente;

    }


    if (filtros.id_odontologo) {

      where.id_odontologo =
        filtros.id_odontologo;

    }


    if (filtros.id_servicio) {

      where.id_servicio =
        filtros.id_servicio;

    }


    if (filtros.estado) {

      where.estado =
        filtros.estado;

    }


    if (filtros.fecha) {

      where.fecha =
        filtros.fecha;

    }

    else if (
      filtros.fecha_desde ||
      filtros.fecha_hasta
    ) {

      where.fecha = {};

      if (filtros.fecha_desde) {

        where.fecha[Op.gte] =
          filtros.fecha_desde;

      }

      if (filtros.fecha_hasta) {

        where.fecha[Op.lte] =
          filtros.fecha_hasta;

      }

    }


    return Cita.findAll({

      where,

      include: [

        {
          association: "paciente",
        },

        {
          association: "odontologo",
        },

        {
          association: "servicio",
        },

      ],

      order: [

        ["fecha", "ASC"],

        ["hora", "ASC"],

      ],

    });
  }


  // =========================================================
  // OBTENER CITA POR ID
  // =========================================================

  static async obtenerCitaPorId(
    id,
    usuario
  ) {

    const cita =
      await Cita.findByPk(

        id,

        {

          include: [

            {
              association: "paciente",
            },

            {
              association: "odontologo",
            },

            {
              association: "servicio",
            },

            {
              association: "historia",
            },

          ],

        }

      );


    if (!cita) {

      throw new AppError(
        "La cita solicitada no existe.",
        404
      );
    }


    // PACIENTE solamente puede ver
    // sus propias citas.

    if (
      usuario.rol === "PACIENTE"
    ) {

      await this._validarPacienteAutenticado(
        cita.id_paciente,
        usuario
      );

    }


    // ODONTÓLOGO solamente puede ver
    // sus propias citas.

    if (
      usuario.rol === "ODONTOLOGO"
    ) {

      await this._validarOdontologoAutenticado(
        cita.id_odontologo,
        usuario
      );

    }


    return cita;
  }


  // =========================================================
  // OBTENER CITAS POR ODONTÓLOGO
  // =========================================================

  static async obtenerCitasPorOdontologo(
    id_odontologo,
    filtros = {},
    usuario
  ) {

    await this._validarOdontologoAutenticado(
      id_odontologo,
      usuario
    );


    const where = {
      id_odontologo,
    };


    if (filtros.estado) {

      where.estado =
        filtros.estado;

    }


    if (filtros.fecha) {

      where.fecha =
        filtros.fecha;

    }

    else if (
      filtros.fecha_desde ||
      filtros.fecha_hasta
    ) {

      where.fecha = {};

      if (filtros.fecha_desde) {

        where.fecha[Op.gte] =
          filtros.fecha_desde;

      }

      if (filtros.fecha_hasta) {

        where.fecha[Op.lte] =
          filtros.fecha_hasta;

      }

    }


    return Cita.findAll({

      where,

      include: [

        {
          association: "paciente",
        },

        {
          association: "servicio",
        },

        {
          association: "historia",
        },

      ],

      order: [

        ["fecha", "ASC"],

        ["hora", "ASC"],

      ],

    });
  }


  // =========================================================
  // OBTENER CITAS POR PACIENTE
  // =========================================================

  static async obtenerCitasPorPaciente(
    id_paciente,
    filtros = {},
    usuario
  ) {

    await this._validarPacienteAutenticado(
      id_paciente,
      usuario
    );


    const where = {
      id_paciente,
    };


    if (filtros.estado) {

      where.estado =
        filtros.estado;

    }


    if (filtros.fecha) {

      where.fecha =
        filtros.fecha;

    }

    else if (
      filtros.fecha_desde ||
      filtros.fecha_hasta
    ) {

      where.fecha = {};

      if (filtros.fecha_desde) {

        where.fecha[Op.gte] =
          filtros.fecha_desde;

      }

      if (filtros.fecha_hasta) {

        where.fecha[Op.lte] =
          filtros.fecha_hasta;

      }

    }


    return Cita.findAll({

      where,

      include: [

        {
          association: "odontologo",
        },

        {
          association: "servicio",
        },

        {
          association: "historia",
        },

      ],

      order: [

        ["fecha", "ASC"],

        ["hora", "ASC"],

      ],

    });
  }


  // =========================================================
  // ACTUALIZAR CITA
  // =========================================================

  static async actualizarCita(
    id,
    datos,
    usuario
  ) {

    const cita =
      await Cita.findByPk(id);


    if (!cita) {

      throw new AppError(
        "La cita solicitada no existe.",
        404
      );
    }


    // -------------------------------------------------------
    // VERIFICAR PROPIEDAD
    // -------------------------------------------------------

    if (
      usuario.rol === "PACIENTE"
    ) {

      await this._validarPacienteAutenticado(
        cita.id_paciente,
        usuario
      );

    }


    if (
      usuario.rol === "ODONTOLOGO"
    ) {

      await this._validarOdontologoAutenticado(
        cita.id_odontologo,
        usuario
      );

    }


    // -------------------------------------------------------
    // VALIDAR ESTADO
    // -------------------------------------------------------

    if (
      cita.estado === "CANCELADA"
    ) {

      throw new AppError(
        "No se puede reprogramar una cita CANCELADA.",
        400
      );
    }


    if (
      cita.estado === "ATENDIDA"
    ) {

      throw new AppError(
        "No se puede reprogramar una cita ya ATENDIDA.",
        400
      );
    }


    // -------------------------------------------------------
    // OBTENER DATOS NUEVOS
    // -------------------------------------------------------

    const id_odontologo =
      datos.id_odontologo ??
      cita.id_odontologo;


    const id_servicio =
      datos.id_servicio ??
      cita.id_servicio;


    const fecha =
      datos.fecha ??
      cita.fecha;


    const hora =
      datos.hora ??
      cita.hora;


    // -------------------------------------------------------
    // PACIENTE
    // -------------------------------------------------------

    let id_paciente =
      cita.id_paciente;


    // Un paciente no puede cambiar
    // el paciente de la cita.

    if (
      usuario.rol !== "PACIENTE" &&
      datos.id_paciente !== undefined
    ) {

      id_paciente =
        datos.id_paciente;
    }


    // -------------------------------------------------------
    // VALIDAR PACIENTE EN CASO DE CAMBIO
    // -------------------------------------------------------

    if (
      id_paciente !== null &&
      id_paciente !== undefined
    ) {

      await this._obtenerPacienteOrFail(
        id_paciente
      );
    }


    // -------------------------------------------------------
    // VALIDAR NUEVO HORARIO
    // -------------------------------------------------------

    const hora_fin =
      await this._validarYCalcularCita({

        id_odontologo,
        id_servicio,
        fecha,
        hora,

        idCitaExcluir:
          cita.id,

      });


    // -------------------------------------------------------
    // ACTUALIZAR
    // -------------------------------------------------------

    cita.id_paciente =
      id_paciente;

    cita.id_odontologo =
      id_odontologo;

    cita.id_servicio =
      id_servicio;

    cita.fecha =
      fecha;

    cita.hora =
      hora;

    cita.hora_fin =
      hora_fin;


    await cita.save();


    return cita;
  }


  // =========================================================
  // CANCELAR CITA
  // =========================================================

  static async cancelarCita(
    id,
    usuario
  ) {

    const cita =
      await Cita.findByPk(id);


    if (!cita) {

      throw new AppError(
        "La cita solicitada no existe.",
        404
      );
    }


    // PACIENTE solamente puede cancelar
    // sus propias citas.

    if (
      usuario.rol === "PACIENTE"
    ) {

      await this._validarPacienteAutenticado(
        cita.id_paciente,
        usuario
      );

    }


    // ODONTÓLOGO solamente puede cancelar
    // sus propias citas.

    if (
      usuario.rol === "ODONTOLOGO"
    ) {

      await this._validarOdontologoAutenticado(
        cita.id_odontologo,
        usuario
      );

    }


    if (
      cita.estado === "ATENDIDA"
    ) {

      throw new AppError(
        "No se puede cancelar una cita ya ATENDIDA.",
        400
      );
    }


    if (
      cita.estado === "CANCELADA"
    ) {

      throw new AppError(
        "La cita ya se encuentra CANCELADA.",
        400
      );
    }


    cita.estado =
      "CANCELADA";


    await cita.save();


    return cita;
  }

}


export default CitaService;