import catchAsync from "../utils/errors/catchAsync.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";
import CitaService from "../services/citaService.js";


class CitaController {


  // =========================================================
  // CREAR CITA
  // =========================================================

  static crearCita = catchAsync(
    async (req, res) => {

      const nuevaCita =
        await CitaService.crearCita(
          req.body,
          req.usuario
        );


      enviarRespuestaExitosa(
        res,
        201,
        "Cita creada correctamente",
        nuevaCita
      );

    }
  );


  // =========================================================
  // OBTENER TODAS LAS CITAS
  // =========================================================

  static obtenerCitas = catchAsync(
    async (req, res) => {

      const citas =
        await CitaService.obtenerCitas(
          req.query
        );


      enviarRespuestaExitosa(
        res,
        200,
        "Listado de citas obtenido con éxito",
        citas
      );

    }
  );


  // =========================================================
  // OBTENER CITA POR ID
  // =========================================================

  static obtenerCitaPorId = catchAsync(
    async (req, res) => {

      const cita =
        await CitaService.obtenerCitaPorId(
          req.params.id,
          req.usuario
        );


      enviarRespuestaExitosa(
        res,
        200,
        "Cita encontrada con éxito",
        cita
      );

    }
  );


  // =========================================================
  // OBTENER CITAS POR ODONTÓLOGO
  // =========================================================

  static obtenerCitasPorOdontologo =
    catchAsync(
      async (req, res) => {

        const citas =
          await CitaService.obtenerCitasPorOdontologo(

            req.params.id_odontologo,

            req.query,

            req.usuario

          );


        enviarRespuestaExitosa(
          res,
          200,
          "Citas del odontólogo obtenidas con éxito",
          citas
        );

      }
    );


  // =========================================================
  // OBTENER CITAS POR PACIENTE
  // =========================================================

  static obtenerCitasPorPaciente =
    catchAsync(
      async (req, res) => {

        const citas =
          await CitaService.obtenerCitasPorPaciente(

            req.params.id_paciente,

            req.query,

            req.usuario

          );


        enviarRespuestaExitosa(
          res,
          200,
          "Citas del paciente obtenidas con éxito",
          citas
        );

      }
    );


  // =========================================================
  // ACTUALIZAR CITA
  // =========================================================

  static actualizarCita =
    catchAsync(
      async (req, res) => {

        const citaActualizada =
          await CitaService.actualizarCita(

            req.params.id,

            req.body,

            req.usuario

          );


        enviarRespuestaExitosa(
          res,
          200,
          "Cita actualizada correctamente",
          citaActualizada
        );

      }
    );


  // =========================================================
  // CANCELAR CITA
  // =========================================================

  static cancelarCita =
    catchAsync(
      async (req, res) => {

        const citaCancelada =
          await CitaService.cancelarCita(

            req.params.id,

            req.usuario

          );


        enviarRespuestaExitosa(
          res,
          200,
          "Cita cancelada correctamente",
          citaCancelada
        );

      }
    );

}


export default CitaController;
