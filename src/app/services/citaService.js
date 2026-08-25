import { Op } from "sequelize";

import {
  Cita,
  Odontologo,
  Paciente,
  Servicio,
  HorarioOdontologo,
  OdontologoServicio,
} from "../models/indexModel.js";

import AppError from "../utils/errors/appError.js";
import EmailService from "../utils/emailService.js";

import {
  horaAMinutos,
  minutosAHora,
  sumarMinutosAHora,
  obtenerDiaSemana,
  combinarFechaHora,
  seCruzanRangos,
} from "../utils/timeUtils.js";

class CitaService {
  // =========================================================
  // MÉTODOS PRIVADOS DE VALIDACIÓN Y BÚSQUEDA
  // =========================================================

  static async _obtenerOdontologoOrFail(id_odontologo) {
    const odontologo = await Odontologo.findByPk(id_odontologo);

    if (!odontologo) {
      throw new AppError("El odontólogo indicado no existe.", 404);
    }

    return odontologo;
  }

  static async _obtenerPacienteOrFail(id_paciente) {
    const paciente = await Paciente.findByPk(id_paciente);

    if (!paciente) {
      throw new AppError("El paciente indicado no existe.", 404);
    }

    return paciente;
  }

  static async _obtenerPacienteDelUsuario(usuario) {
    if (!usuario?.id) {
      throw new AppError(
        "No se pudo identificar al usuario autenticado.",
        401
      );
    }

    const paciente = await Paciente.findOne({
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

  static async _obtenerServicioOrFail(id_servicio) {
    const servicio = await Servicio.findByPk(id_servicio);

    if (!servicio) {
      throw new AppError("El servicio indicado no existe.", 404);
    }

    if (servicio.activo === false) {
      throw new AppError("El servicio indicado no está activo.", 400);
    }

    return servicio;
  }

  static async _validarOdontologoPrestaServicio(
    id_odontologo,
    id_servicio
  ) {
    const relacion = await OdontologoServicio.findOne({
      where: {
        id_odontologo,
        id_servicio,
      },
    });

    if (!relacion) {
      throw new AppError(
        "El odontólogo seleccionado no ofrece el servicio solicitado.",
        400
      );
    }
  }

  // =========================================================
  // BUSCAR ODONTÓLOGO DISPONIBLE AUTOMÁTICAMENTE
  // =========================================================

  static async _buscarOdontologoDisponibleParaServicio(
    id_servicio,
    fecha,
    hora,
    duracionMinutos
  ) {
    const fechaLimpia = String(fecha).split("T")[0];

    const fechaHoraCita = combinarFechaHora(fechaLimpia, hora);

    if (fechaHoraCita.getTime() < Date.now()) {
      throw new AppError(
        "No se pueden agendar citas en el pasado.",
        400
      );
    }

    const servicio = await Servicio.findByPk(id_servicio, {
      include: [
        {
          association: "odontologos",
        },
      ],
    });

    if (
      !servicio ||
      !servicio.odontologos ||
      servicio.odontologos.length === 0
    ) {
      throw new AppError(
        "No hay ningún odontólogo asignado para realizar el servicio seleccionado.",
        400
      );
    }

    const hora_fin = sumarMinutosAHora(
      hora,
      duracionMinutos
    );

    for (const odontologo of servicio.odontologos) {
      try {
        await this._validarDentroDeTurno(
          odontologo.id,
          fechaLimpia,
          hora,
          hora_fin
        );

        await this._validarSinCruces(
          odontologo.id,
          fechaLimpia,
          hora,
          hora_fin
        );

        return {
          id_odontologo: odontologo.id,
          hora_fin,
        };
      } catch (error) {
        continue;
      }
    }

    throw new AppError(
      "No hay odontólogos disponibles para este servicio en la fecha y hora seleccionadas.",
      409
    );
  }

  // =========================================================
  // CONTROL DE ACCESO
  // =========================================================

  static async _validarPacienteAutenticado(
    id_paciente,
    usuario
  ) {
    if (!usuario) {
      throw new AppError(
        "Debes iniciar sesión para realizar esta operación.",
        401
      );
    }

    if (usuario.rol === "ADMIN") {
      return;
    }

    if (usuario.rol !== "PACIENTE") {
      throw new AppError(
        "No tienes permisos para consultar citas de pacientes.",
        403
      );
    }

    const paciente = await this._obtenerPacienteOrFail(
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

  static async _validarOdontologoAutenticado(
    id_odontologo,
    usuario
  ) {
    if (!usuario) {
      throw new AppError(
        "Debes iniciar sesión para realizar esta operación.",
        401
      );
    }

    if (usuario.rol === "ADMIN") {
      return;
    }

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
  // VALIDACIONES HORARIAS
  // =========================================================

  static async _validarDentroDeTurno(
    id_odontologo,
    fecha,
    hora,
    hora_fin
  ) {
    const fechaLimpia = String(fecha).split("T")[0];

    const diaSemana =
      obtenerDiaSemana(fechaLimpia);

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
          horaAMinutos(turno.hora_inicio);

        const finTurnoMin =
          horaAMinutos(turno.hora_fin);

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

  static async _validarSinCruces(
    id_odontologo,
    fecha,
    hora,
    hora_fin,
    idCitaExcluir = null
  ) {
    const fechaLimpia =
      String(fecha).split("T")[0];

    const where = {
      id_odontologo,
      fecha: fechaLimpia,
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
      citasDelDia.some((citaExistente) =>
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

  static async _validarYCalcularCita({
    id_odontologo,
    id_servicio,
    fecha,
    hora,
    idCitaExcluir = null,
  }) {
    const fechaLimpia =
      String(fecha).split("T")[0];

    await this._obtenerOdontologoOrFail(
      id_odontologo
    );

    const servicio =
      await this._obtenerServicioOrFail(
        id_servicio
      );

    const fechaHoraCita =
      combinarFechaHora(
        fechaLimpia,
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
      fechaLimpia,
      hora,
      hora_fin
    );

    await this._validarSinCruces(
      id_odontologo,
      fechaLimpia,
      hora,
      hora_fin,
      idCitaExcluir
    );

    return hora_fin;
  }

  // =========================================================
  // DISPONIBILIDAD
  // =========================================================

  static async obtenerDisponibilidad(
    id_servicio,
    fecha,
    id_odontologo = null
  ) {
    if (!id_servicio || !fecha) {
      throw new AppError(
        "El servicio y la fecha son obligatorios.",
        400
      );
    }

    const fechaLimpia =
      String(fecha).split("T")[0];

    const servicio =
      await this._obtenerServicioOrFail(
        id_servicio
      );

    const diaSemana =
      obtenerDiaSemana(fechaLimpia);

    let idsOdontologos = [];

    if (id_odontologo) {
      await this._obtenerOdontologoOrFail(
        id_odontologo
      );

      await this._validarOdontologoPrestaServicio(
        id_odontologo,
        id_servicio
      );

      idsOdontologos = [
        Number(id_odontologo),
      ];
    } else {
      const profesionales =
        await Servicio.findByPk(
          id_servicio,
          {
            include: [
              {
                association: "odontologos",
                attributes: ["id"],
              },
            ],
          }
        );

      idsOdontologos =
        (
          profesionales?.odontologos ||
          []
        ).map((o) => Number(o.id));
    }

    if (idsOdontologos.length === 0) {
      return {
        fecha: fechaLimpia,
        horasDisponibles: [],
      };
    }

    const turnos =
      await HorarioOdontologo.findAll({
        where: {
          id_odontologo: {
            [Op.in]: idsOdontologos,
          },
          dia_semana: diaSemana,
        },
      });

    if (turnos.length === 0) {
      return {
        fecha: fechaLimpia,
        horasDisponibles: [],
      };
    }

    const citasExistentes =
      await Cita.findAll({
        where: {
          id_odontologo: {
            [Op.in]: idsOdontologos,
          },
          fecha: fechaLimpia,
          estado: {
            [Op.in]: [
              "PROGRAMADA",
              "ATENDIDA",
            ],
          },
        },
      });

    const duracion =
      Number(servicio.duracion_minutos);

    const horasDisponibles = new Set();

    const pasoMinutos = 30;

    const ahora = new Date();

    for (const turno of turnos) {
      let inicioMin =
        horaAMinutos(
          turno.hora_inicio
        );

      const finTurnoMin =
        horaAMinutos(
          turno.hora_fin
        );

      const citasOdonto =
        citasExistentes.filter(
          (cita) =>
            Number(cita.id_odontologo) ===
            Number(turno.id_odontologo)
        );

      while (
        inicioMin + duracion <=
        finTurnoMin
      ) {
        const horaTexto =
          minutosAHora(inicioMin);

        const finCitaMin =
          inicioMin + duracion;

        const fechaHoraSlot =
          combinarFechaHora(
            fechaLimpia,
            horaTexto
          );

        if (
          fechaHoraSlot.getTime() >
          ahora.getTime()
        ) {
          const estaOcupado =
            citasOdonto.some(
              (cita) =>
                seCruzanRangos(
                  inicioMin,
                  finCitaMin,
                  horaAMinutos(cita.hora),
                  horaAMinutos(cita.hora_fin)
                )
            );

          if (!estaOcupado) {
            horasDisponibles.add(
              horaTexto
            );
          }
        }

        inicioMin += pasoMinutos;
      }
    }

    return {
      fecha: fechaLimpia,
      horasDisponibles:
        Array.from(
          horasDisponibles
        ).sort(),
    };
  }

  // =========================================================
  // VERIFICACIÓN DE EMAIL
  // =========================================================

  static async verificarEmailExistente(
    email
  ) {
    if (!email) {
      return {
        existe: false,
        tieneCuenta: false,
        datosPaciente: null,
      };
    }

    const emailSanitizado =
      email.trim().toLowerCase();

    const paciente =
      await Paciente.findOne({
        where: {
          email: emailSanitizado,
        },
      });

    if (!paciente) {
      return {
        existe: false,
        tieneCuenta: false,
        datosPaciente: null,
      };
    }

    const tieneCuenta =
      paciente.id_usuario !== null;

    return {
      existe: true,
      tieneCuenta,
      datosPaciente: {
        id: paciente.id,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        celular: paciente.celular,
        genero:
          paciente.genero || "OTRO",
      },
    };
  }

  // =========================================================
  // CREAR CITA
  // =========================================================

  static async crearCita(
    datos,
    usuario = null
  ) {
    let {
      id_paciente,
      id_odontologo,
      id_servicio,
      fecha,
      hora,
      nombre,
      apellido,
      celular,
      email,
      genero,
    } = datos;

    if (!id_servicio || !fecha || !hora) {
      throw new AppError(
        "id_servicio, fecha y hora son obligatorios.",
        400
      );
    }

    fecha =
      String(fecha).split("T")[0];

    const servicio =
      await this._obtenerServicioOrFail(
        id_servicio
      );

    let hora_fin;

    // =======================================================
    // SI SE ENVÍA ODONTÓLOGO
    // =======================================================

    if (id_odontologo) {
      await this._validarOdontologoPrestaServicio(
        id_odontologo,
        id_servicio
      );

      hora_fin =
        await this._validarYCalcularCita({
          id_odontologo,
          id_servicio,
          fecha,
          hora,
        });
    }

    // =======================================================
    // SI NO SE ENVÍA ODONTÓLOGO
    // EL SISTEMA LO ASIGNA AUTOMÁTICAMENTE
    // =======================================================

    else {
      const asignacion =
        await this._buscarOdontologoDisponibleParaServicio(
          id_servicio,
          fecha,
          hora,
          servicio.duracion_minutos
        );

      id_odontologo =
        asignacion.id_odontologo;

      hora_fin =
        asignacion.hora_fin;
    }

    let pacienteId = null;

    let correoNotificacion =
      email
        ? email.trim().toLowerCase()
        : null;

    let nombrePaciente =
      nombre
        ? nombre.trim()
        : "Paciente";

    // =======================================================
    // USUARIO PACIENTE AUTENTICADO
    // =======================================================

    if (
      usuario &&
      usuario.rol === "PACIENTE"
    ) {
      const paciente =
        await this._obtenerPacienteDelUsuario(
          usuario
        );

      pacienteId =
        paciente.id;

      correoNotificacion =
        paciente.email;

      nombrePaciente =
        `${paciente.nombre} ${paciente.apellido}`;
    }

    // =======================================================
    // ADMINISTRADOR / ODONTÓLOGO
    // =======================================================

    else if (
      usuario &&
      (
        usuario.rol === "ADMIN" ||
        usuario.rol === "ODONTOLOGO"
      )
    ) {
      if (id_paciente) {
        const paciente =
          await this._obtenerPacienteOrFail(
            id_paciente
          );

        pacienteId =
          paciente.id;

        correoNotificacion =
          paciente.email;

        nombrePaciente =
          `${paciente.nombre} ${paciente.apellido}`;
      }
    }

    // =======================================================
    // INVITADO
    // =======================================================

    else {
      if (
        !email ||
        !celular ||
        !nombre
      ) {
        throw new AppError(
          "Nombre, celular y correo son obligatorios para agendar como invitado.",
          400
        );
      }

      const emailSanitizado =
        email.trim().toLowerCase();

      const celularSanitizado =
        celular.trim();

      const nombreInput =
        nombre.trim();

      const apellidoInput =
        (
          apellido ||
          "Invitado"
        ).trim();

      const pacienteExistente =
        await Paciente.findOne({
          where: {
            email: emailSanitizado,
          },
        });

      // =====================================================
      // CORREO YA REGISTRADO
      // =====================================================

      // No se modifican los datos personales al agendar como invitado.
      // Esto evita que alguien cambie el nombre o celular asociado a un
      // correo existente y, además, obliga a usar la cuenta correspondiente.
      if (pacienteExistente) {
        const mensajeCorreoEnUso =
          pacienteExistente.id_usuario !== null
            ? "Este correo está asociado a una cuenta existente. Por favor, inicia sesión para agendar la cita."
            : "Este correo ya está en uso por un paciente. Verifica los datos o utiliza otro correo para agendar la cita.";

        throw new AppError(
          mensajeCorreoEnUso,
          400
        );
      }

      // =====================================================
      // NUEVO PACIENTE INVITADO
      // =====================================================

      else {
        try {
          const nuevoPaciente =
            await Paciente.create({
              nombre: nombreInput,
              apellido: apellidoInput,
              celular:
                celularSanitizado,
              email:
                emailSanitizado,
              genero:
                genero || "OTRO",
              id_usuario: null,
            });

          pacienteId =
            nuevoPaciente.id;

          correoNotificacion =
            nuevoPaciente.email;

          nombrePaciente =
            `${nuevoPaciente.nombre} ${nuevoPaciente.apellido}`;
        } catch (errorPaciente) {
          console.error(
            "Error al registrar paciente invitado:",
            errorPaciente
          );

          throw new AppError(
            "No se pudo guardar la información del paciente invitado. Revisa los datos enviados.",
            400
          );
        }
      }
    }

    // =======================================================
    // ÚLTIMA VALIDACIÓN DE SEGURIDAD
    // =======================================================

    await this._validarSinCruces(
      id_odontologo,
      fecha,
      hora,
      hora_fin
    );

    // =======================================================
    // CREAR CITA
    // =======================================================

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

    // =======================================================
    // ENVIAR CORREO
    // =======================================================

    try {
      const odontologo =
        await Odontologo.findByPk(
          id_odontologo
        );

      if (
        correoNotificacion &&
        typeof EmailService
          ?.enviarCorreoConfirmacionCita ===
          "function"
      ) {
        await EmailService.enviarCorreoConfirmacionCita(
          correoNotificacion,
          {
            nombrePaciente,
            servicio:
              servicio.nombre,
            fecha,
            hora,
            odontologo:
              odontologo
                ? `${odontologo.nombre} ${odontologo.apellido}`
                : "Odontólogo asignado",
          }
        );

        console.log(
          `Correo enviado exitosamente a ${correoNotificacion}`
        );
      }
    } catch (emailError) {
      console.error(
        "Fallo al enviar correo de confirmación:",
        emailError?.message ||
          emailError
      );
    }

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
        String(filtros.fecha)
          .split("T")[0];
    } else if (
      filtros.fecha_desde ||
      filtros.fecha_hasta
    ) {
      where.fecha = {};

      if (filtros.fecha_desde) {
        where.fecha[Op.gte] =
          String(
            filtros.fecha_desde
          ).split("T")[0];
      }

      if (filtros.fecha_hasta) {
        where.fecha[Op.lte] =
          String(
            filtros.fecha_hasta
          ).split("T")[0];
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
      await Cita.findByPk(id, {
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
      });

    if (!cita) {
      throw new AppError(
        "La cita solicitada no existe.",
        404
      );
    }

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

    return cita;
  }

  // =========================================================
  // CITAS POR ODONTÓLOGO
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
        String(filtros.fecha)
          .split("T")[0];
    } else if (
      filtros.fecha_desde ||
      filtros.fecha_hasta
    ) {
      where.fecha = {};

      if (filtros.fecha_desde) {
        where.fecha[Op.gte] =
          String(
            filtros.fecha_desde
          ).split("T")[0];
      }

      if (filtros.fecha_hasta) {
        where.fecha[Op.lte] =
          String(
            filtros.fecha_hasta
          ).split("T")[0];
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
  // CITAS POR PACIENTE
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
        String(filtros.fecha)
          .split("T")[0];
    } else if (
      filtros.fecha_desde ||
      filtros.fecha_hasta
    ) {
      where.fecha = {};

      if (filtros.fecha_desde) {
        where.fecha[Op.gte] =
          String(
            filtros.fecha_desde
          ).split("T")[0];
      }

      if (filtros.fecha_hasta) {
        where.fecha[Op.lte] =
          String(
            filtros.fecha_hasta
          ).split("T")[0];
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

    const id_odontologo =
      datos.id_odontologo ??
      cita.id_odontologo;

    const id_servicio =
      datos.id_servicio ??
      cita.id_servicio;

    const fecha =
      datos.fecha
        ? String(datos.fecha).split("T")[0]
        : cita.fecha;

    const hora =
      datos.hora ??
      cita.hora;

    let id_paciente =
      cita.id_paciente;

    if (
      usuario.rol !== "PACIENTE" &&
      datos.id_paciente !==
        undefined
    ) {
      id_paciente =
        datos.id_paciente;
    }

    if (
      id_paciente !== null &&
      id_paciente !== undefined
    ) {
      await this._obtenerPacienteOrFail(
        id_paciente
      );
    }

    await this._validarOdontologoPrestaServicio(
      id_odontologo,
      id_servicio
    );

    const hora_fin =
      await this._validarYCalcularCita({
        id_odontologo,
        id_servicio,
        fecha,
        hora,
        idCitaExcluir:
          cita.id,
      });

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