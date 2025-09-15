import PacienteService from "../services/pacientesServices.js";
import { AppError, catchAsync, manejadorRespuestaExitosa } from "../utils/index.js";

/**
 * Controlador para operaciones CRUD de pacientes.
 * Utiliza catchAsync para manejar errores automáticamente.
 */
class PacienteController {

  // Crear un nuevo paciente
  crearPaciente = catchAsync(async (req, res) => {
    const nuevoPaciente = await PacienteService.crearPaciente(req.body);
        manejadorRespuestaExitosa(res,200, 'Paciente creado con exito', nuevoPaciente)
  });

  // Obtener todos los pacientes
  obtenerPacientes = catchAsync(async (req, res) => {
    const pacientes = await PacienteService.obtenerPacientes();
    manejadorRespuestaExitosa(res,200, 'Pacientes consultados con exito', pacientes)
  });


//Seguir poniendo el manejador




  // Obtener un paciente específico por su ID
  obtenerPacientePorId = catchAsync(async (req, res) => {
    const paciente = await PacienteService.obtenerPacientePorId(req.params.id);

    if (!paciente) throw new AppError("Paciente no encontrado", 404);

    res.status(200).json({ status: "success", data: paciente });
  });

  // Actualizar un paciente existente
  actualizarPaciente = catchAsync(async (req, res) => {
    const pacienteActualizado = await PacienteService.actualizarPaciente(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      message: "Paciente actualizado correctamente",
      data: pacienteActualizado
    });
  });

  // Eliminar un paciente
  eliminarPaciente = catchAsync(async (req, res) => {
    await PacienteService.eliminarPaciente(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Paciente eliminado correctamente"
    });
  });
}

// Exportamos una instancia única del controlador
export default new PacienteController();
