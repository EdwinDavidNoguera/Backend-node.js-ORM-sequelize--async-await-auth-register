import {
  Cita,
  HistoriaOdontologica,
  Odontologo,
  Paciente,
} from "../models/indexModel.js";

import AppError from "../utils/errors/appError.js";

/**
 * =========================================================
 * NOTA SOBRE EL ESQUEMA
 * =========================================================
 *
 * La tabla física `historia_odontologica`
 * NO duplica:
 *
 * - id_paciente
 * - id_odontologo
 *
 * Ambos se obtienen siempre desde la cita asociada.
 *
 * La cita es la fuente de verdad.
 */

const incluirCitaConDetalle = {
  association: "cita",

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
};

class HistorialService {
  // =========================================================
  // OBTENER CITA O ERROR
  // =========================================================

  static async _obtenerCitaOrFail(id_cita) {
    const cita = await Cita.findByPk(id_cita);

    if (!cita) {
      throw new AppError("La cita indicada no existe.", 404);
    }

    return cita;
  }

  // =========================================================
  // OBTENER PACIENTE O ERROR
  // =========================================================

  /**
   * Usado por `obtenerDatosHistorialParaPDF` para confirmar que el
   * paciente existe antes de validar permisos o buscar su historial.
   */

  static async _obtenerPacienteOrFail(id_paciente) {
    const paciente = await Paciente.findByPk(id_paciente);

    if (!paciente) {
      throw new AppError("El paciente indicado no existe.", 404);
    }

    return paciente;
  }

  // =========================================================
  // VALIDAR QUIÉN PUEDE GESTIONAR UNA CITA
  // =========================================================

  /**
   * Esta validación se utiliza para:
   *
   * - Crear una historia.
   * - Actualizar una historia.
   *
   * ADMIN:
   * Puede trabajar con cualquier cita.
   *
   * ODONTOLOGO:
   * Solo puede gestionar historias de sus propias citas.
   *
   * PACIENTE:
   * No puede gestionar historias.
   */

  static async _validarAccesoGestionCita(cita, usuario) {
    // -------------------------------------------------------
    // ADMIN
    // -------------------------------------------------------

    if (usuario.rol === "ADMIN") {
      return;
    }

    // -------------------------------------------------------
    // ODONTÓLOGO
    // -------------------------------------------------------

    if (usuario.rol === "ODONTOLOGO") {
      const odontologo = await Odontologo.findByPk(cita.id_odontologo);

      if (!odontologo) {
        throw new AppError("El odontólogo asociado a la cita no existe.", 404);
      }

      if (Number(odontologo.id_usuario) !== Number(usuario.id)) {
        throw new AppError(
          "No tienes autorización para gestionar el historial de esta cita.",
          403,
        );
      }

      return;
    }

    // -------------------------------------------------------
    // PACIENTE
    // -------------------------------------------------------

    throw new AppError(
      "No tienes autorización para gestionar historias clínicas.",
      403,
    );
  }

  // =========================================================
  // VALIDAR QUIÉN PUEDE CONSULTAR EL HISTORIAL DE UN PACIENTE
  // =========================================================

  /**
   * Usada por `obtenerDatosHistorialParaPDF` (descarga del PDF).
   *
   * ADMIN:
   * Puede consultar el historial de cualquier paciente.
   *
   * ODONTOLOGO:
   * Puede consultar el historial de cualquier paciente.
   *
   * PACIENTE:
   * Únicamente el suyo propio — se valida comparando
   * `paciente.id_usuario` contra el `id` del JWT, ya que el token
   * NO trae `id_paciente` directamente (ver payload del proyecto).
   */

  static _validarAccesoConsultaPaciente(paciente, usuario) {
    if (usuario.rol === "ADMIN" || usuario.rol === "ODONTOLOGO") {
      return;
    }

    if (Number(paciente.id_usuario) !== Number(usuario.id)) {
      throw new AppError(
        "No tienes autorización para consultar este historial clínico.",
        403,
      );
    }
  }

  // =========================================================
  // BUSCAR HISTORIALES DE UN PACIENTE (consulta compartida)
  // =========================================================

  /**
   * Centraliza la consulta que trae los historiales de un paciente con
   * su cita, paciente, odontólogo y servicio incluidos, ordenados
   * cronológicamente (fecha y hora de la cita, ascendente).
   *
   * La usan tanto `obtenerHistorialPorPaciente` como
   * `obtenerDatosHistorialParaPDF` — antes esta misma consulta estaba
   * duplicada, ahora vive en un solo lugar.
   */

  static async _buscarHistorialesDePaciente(id_paciente) {
    return HistoriaOdontologica.findAll({
      include: [
        {
          ...incluirCitaConDetalle,

          where: {
            id_paciente,
          },

          required: true,
        },
      ],

      order: [
        [
          {
            model: Cita,
            as: "cita",
          },

          "fecha",

          "ASC",
        ],

        [
          {
            model: Cita,
            as: "cita",
          },

          "hora",

          "ASC",
        ],
      ],
    });
  }

  // =========================================================
  // CREAR HISTORIAL
  // =========================================================

  /**
   * Crea un historial clínico.
   *
   * Al crear el historial:
   *
   * - Se verifica la cita.
   * - Se verifica autorización.
   * - Se evita duplicar historias.
   * - La cita pasa automáticamente a ATENDIDA.
   */

  static async crearHistorial(datos, usuario) {
    const {
      id_cita,
      motivo_consulta,
      diagnostico,
      tratamiento_realizado,
      medicamentos_recetados,
      observaciones,
    } = datos;

    // -------------------------------------------------------
    // CAMPOS OBLIGATORIOS
    // -------------------------------------------------------

    if (!id_cita || !diagnostico || !tratamiento_realizado) {
      throw new AppError(
        "id_cita, diagnostico y tratamiento_realizado son obligatorios.",
        400,
      );
    }

    // -------------------------------------------------------
    // OBTENER CITA
    // -------------------------------------------------------

    const cita = await this._obtenerCitaOrFail(id_cita);

    // -------------------------------------------------------
    // VALIDAR AUTORIZACIÓN
    // -------------------------------------------------------

    await this._validarAccesoGestionCita(cita, usuario);

    // -------------------------------------------------------
    // VALIDAR ESTADO
    // -------------------------------------------------------

    if (cita.estado === "CANCELADA") {
      throw new AppError(
        "No se puede registrar historial clínico sobre una cita CANCELADA.",
        400,
      );
    }

    // -------------------------------------------------------
    // EVITAR HISTORIAL DUPLICADO
    // -------------------------------------------------------

    const historialExistente = await HistoriaOdontologica.findOne({
      where: {
        id_cita,
      },
    });

    if (historialExistente) {
      throw new AppError(
        "Esta cita ya tiene un registro de historial clínico asociado.",
        409,
      );
    }

    // -------------------------------------------------------
    // CREAR HISTORIAL
    // -------------------------------------------------------

    const nuevoHistorial = await HistoriaOdontologica.create({
      id_cita,

      motivo_consulta: motivo_consulta ?? null,

      diagnostico,

      tratamiento_realizado,

      medicamentos_recetados: medicamentos_recetados ?? null,

      observaciones: observaciones ?? null,
    });

    // -------------------------------------------------------
    // MARCAR CITA COMO ATENDIDA
    // -------------------------------------------------------

    if (cita.estado !== "ATENDIDA") {
      cita.estado = "ATENDIDA";

      await cita.save();
    }

    // -------------------------------------------------------
    // DEVOLVER HISTORIA COMPLETA
    // -------------------------------------------------------

    return HistoriaOdontologica.findByPk(
      nuevoHistorial.id,

      {
        include: [incluirCitaConDetalle],
      },
    );
  }

  // =========================================================
  // OBTENER HISTORIAL COMPLETO DE UN PACIENTE
  // =========================================================

  /**
   * ADMIN:
   * Puede consultar el historial de cualquier paciente.
   *
   * ODONTOLOGO:
   * Puede consultar el historial de cualquier paciente.
   *
   * PACIENTE:
   * No utiliza este método (usa la descarga en PDF, que valida
  * pertenencia comparando `paciente.id_usuario` con `usuario.id` del JWT).
   *
   * Comportamiento, firma y respuesta sin cambios: solo se movió la
   * consulta en sí a `_buscarHistorialesDePaciente`.
   */

  static async obtenerHistorialPorPaciente(id_paciente, usuario) {
    // -------------------------------------------------------
    // VALIDAR ID
    // -------------------------------------------------------

    if (!id_paciente) {
      throw new AppError("id_paciente es obligatorio.", 400);
    }

    // -------------------------------------------------------
    // VALIDAR ROL
    // -------------------------------------------------------

    if (usuario.rol === "PACIENTE") {
      const paciente = await this._obtenerPacienteOrFail(id_paciente);
      this._validarAccesoConsultaPaciente(paciente, usuario);
    } else if (usuario.rol !== "ADMIN" && usuario.rol !== "ODONTOLOGO") {
      throw new AppError(
        "No tienes autorización para consultar historias clínicas.",
        403,
      );
    }

    // -------------------------------------------------------
    // OBTENER HISTORIAL
    // -------------------------------------------------------

    return this._buscarHistorialesDePaciente(id_paciente);
  }

  // =========================================================
  // OBTENER HISTORIAL POR ID
  // =========================================================

  /**
   * ADMIN:
   * Puede consultar cualquier historia.
   *
   * ODONTOLOGO:
   * Puede consultar cualquier historia.
   *
   * PACIENTE:
   * No puede consultar directamente la historia.
   */

  static async obtenerHistorialPorId(id, usuario) {
    // -------------------------------------------------------
    // VALIDAR ROL
    // -------------------------------------------------------

    if (usuario.rol !== "ADMIN" && usuario.rol !== "ODONTOLOGO") {
      throw new AppError(
        "No tienes autorización para consultar historias clínicas.",
        403,
      );
    }

    // -------------------------------------------------------
    // BUSCAR HISTORIA
    // -------------------------------------------------------

    const historial = await HistoriaOdontologica.findByPk(
      id,

      {
        include: [incluirCitaConDetalle],
      },
    );

    if (!historial) {
      throw new AppError("El registro de historial solicitado no existe.", 404);
    }

    return historial;
  }

  // =========================================================
  // ACTUALIZAR HISTORIAL
  // =========================================================

  /**
   * ADMIN:
   * Puede modificar cualquier historia.
   *
   * ODONTOLOGO:
   * Solo puede modificar historias correspondientes
   * a sus propias citas.
   *
   * PACIENTE:
   * No puede modificar historias.
   */

  static async actualizarHistorial(id, datos, usuario) {
    // -------------------------------------------------------
    // BUSCAR HISTORIA
    // -------------------------------------------------------

    const historial = await HistoriaOdontologica.findByPk(
      id,

      {
        include: [
          {
            association: "cita",
          },
        ],
      },
    );

    if (!historial) {
      throw new AppError("El registro de historial solicitado no existe.", 404);
    }

    // -------------------------------------------------------
    // VALIDAR AUTORIZACIÓN
    // -------------------------------------------------------

    await this._validarAccesoGestionCita(historial.cita, usuario);

    // -------------------------------------------------------
    // CAMPOS EDITABLES
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // GUARDAR
    // -------------------------------------------------------

    await historial.save();

    // -------------------------------------------------------
    // DEVOLVER HISTORIA ACTUALIZADA
    // -------------------------------------------------------

    return HistoriaOdontologica.findByPk(
      historial.id,

      {
        include: [incluirCitaConDetalle],
      },
    );
  }

  // =========================================================
  // OBTENER DATOS DEL HISTORIAL PARA GENERAR EL PDF
  // =========================================================

  /**
   * Prepara los datos que necesita `generarHistorialPDF` — el generador
   * de PDF nunca toca Sequelize ni conoce reglas de permisos, solo recibe
   * un objeto plano ya resuelto.
   *
   * Orden de validación (importa para no filtrar información de más):
   * 1. id_paciente presente.
   * 2. El paciente existe (404 si no).
   * 3. El usuario autenticado tiene permiso para verlo (403 si no):
   *    - ADMIN u ODONTOLOGO: cualquier paciente.
   *    - PACIENTE: solo si `paciente.id_usuario === usuario.id`.
   * 4. El paciente tiene al menos una historia clínica (404 si no).
   *
   * @param {number|string} id_paciente
   * @param {{ id: number, rol: string }} usuario - `req.usuario`, viene del JWT.
   * @returns {Promise<{ paciente: Object, atenciones: Object[] }>} Datos
   *   planos (sin instancias de Sequelize) listos para el generador de PDF.
   * @throws {AppError} 400 si falta id_paciente · 404 si el paciente no
   *   existe o no tiene historial · 403 si el paciente autenticado intenta
   *   ver el historial de otro.
   */

  static async obtenerDatosHistorialParaPDF(id_paciente, usuario) {
    if (!id_paciente) {
      throw new AppError("id_paciente es obligatorio.", 400);
    }

    const paciente = await this._obtenerPacienteOrFail(id_paciente);

    this._validarAccesoConsultaPaciente(paciente, usuario);

    const historiales = await this._buscarHistorialesDePaciente(id_paciente);

    if (historiales.length === 0) {
      throw new AppError(
        "El paciente no tiene historial clínico registrado.",
        404,
      );
    }

    // Se aplanan las instancias de Sequelize a objetos simples: el
    // generador de PDF no debe depender de la forma interna del ORM.
    const atenciones = historiales.map((historial) => {
      const plano = historial.toJSON();
      const cita = plano.cita ?? {};

      return {
        id: plano.id,
        motivo_consulta: plano.motivo_consulta,
        diagnostico: plano.diagnostico,
        tratamiento_realizado: plano.tratamiento_realizado,
        medicamentos_recetados: plano.medicamentos_recetados,
        observaciones: plano.observaciones,
        fecha: cita.fecha ?? null,
        hora: cita.hora ?? null,
        odontologo: cita.odontologo
          ? `${cita.odontologo.nombre} ${cita.odontologo.apellido}`
          : "No registrado",
        servicio: cita.servicio?.nombre ?? "No registrado",
      };
    });

    return {
      paciente: paciente.toJSON(),
      atenciones,
    };
  }
}

export default HistorialService;
