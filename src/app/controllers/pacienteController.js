import PacienteService from "../services/pacienteServices.js";
import { catchAsync } from "../utils/index.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";

class PacienteController {
  /**
   * Registro completo de paciente (Crea cuenta de acceso + Perfil clínico)
   * POST /api/pacientes/registro
   */
  registrarPacienteConUsuario = catchAsync(async (req, res) => {
    const resultado = await PacienteService.registrarConUsuario(req.body);
    enviarRespuestaExitosa(res, 201, "Paciente y cuenta registrados correctamente", resultado);
  });

  /**
   * Flujo de agenda rápida para pacientes externos/de paso
   * POST /api/pacientes/visitante
   */
  procesarVisitante = catchAsync(async (req, res) => {
    const visitante = await PacienteService.procesarVisitante(req.body);
    enviarRespuestaExitosa(res, 200, "Datos del visitante validados y procesados", visitante);
  });

  /**
   * Obtener todos los pacientes (Incluye sus cuentas de usuario asociadas)
   * GET /api/pacientes
   */
  obtenerPacientes = catchAsync(async (req, res) => {
    const pacientes = await PacienteService.obtenerPacientes();
    enviarRespuestaExitosa(res, 200, "Lista de pacientes obtenida", pacientes);
  });

  /**
   * Obtener perfil completo de un paciente por ID
   * GET /api/pacientes/:id
   */
  obtenerPacientePorId = catchAsync(async (req, res) => {
    const { id } = req.params;
    const paciente = await PacienteService.obtenerPacientePorId(id);
    enviarRespuestaExitosa(res, 200, "Perfil de paciente encontrado", paciente);
  });

  /**
   * Actualizar los datos del perfil clínico del paciente
   * PATCH /api/pacientes/:id
   */
  actualizarPaciente = catchAsync(async (req, res) => {
    const { id } = req.params;
    const resultado = await PacienteService.actualizarPaciente(id, req.body);
    enviarRespuestaExitosa(res, 200, "Perfil de paciente actualizado correctamente", resultado);
  });

  /**
   * Eliminar paciente de forma lógica o física con verificación de citas integradas
   * DELETE /api/pacientes/:id
   */
  eliminarPaciente = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    // Lee el parámetro que permite forzar la eliminación.
    const force = req.query.force === "true";

    const resultado = await PacienteService.eliminarPaciente(id, force);

    // Solicita confirmación cuando existen citas pendientes y no se fuerza la operación.
    if (resultado.requiereConfirmacion) {
      return enviarRespuestaExitosa(res, 200, resultado.message, {
        requiereConfirmacion: true,
        totalCitas: resultado.totalCitas,
      });
    }

    // Confirma la eliminación cuando no existen citas pendientes.
    enviarRespuestaExitosa(res, 200, "Paciente y credenciales asociados eliminados con éxito.");
  });
}

export default new PacienteController();