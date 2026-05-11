import UsuarioService from '../services/usuarioService.js';
import { catchAsync } from '../utils/index.js'; // Ajusta esto si tu catchAsync está en otra ruta
import enviarRespuestaExitosa from '../helpers/enviarRespuestaExitosa.js'; // Ajusta la ruta a tu helper

/**
 * Controlador para operaciones CRUD de usuarios.
 * Utiliza las utilidades catchAsync para manejar errores con el errorHandler personalizado.
 */
class UsuarioController {

  // Crear un nuevo usuario
  crearUsuario = catchAsync(async (req, res) => {
    const nuevoUsuario = await UsuarioService.crearUsuario(req.body);
    enviarRespuestaExitosa(res, 201, 'Usuario creado correctamente', nuevoUsuario);
  });

  // Obtener todos los usuarios
  obtenerUsuarios = catchAsync(async (req, res) => {
    const usuarios = await UsuarioService.obtenerUsuarios();
    enviarRespuestaExitosa(res, 200, 'Usuarios obtenidos con éxito', usuarios);
  });

  // Obtener un usuario específico por su ID
  obtenerUsuario = catchAsync(async (req, res) => {
    // El AppError (404) ya lo lanza el servicio si no existe, 
    // así que el controlador solo asume que si llegó aquí, todo salió bien.
    const usuario = await UsuarioService.obtenerUsuarioPorId(req.params.id);
    enviarRespuestaExitosa(res, 200, 'Usuario obtenido correctamente', usuario);
  });

  // Actualizar un usuario existente
  actualizarUsuario = catchAsync(async (req, res) => {
    const usuarioActualizado = await UsuarioService.actualizarUsuario(req.params.id, req.body);
    enviarRespuestaExitosa(res, 200, 'Usuario actualizado con éxito', usuarioActualizado);
  });

  // Eliminar un usuario
  eliminarUsuario = catchAsync(async (req, res) => {
    await UsuarioService.eliminarUsuario(req.params.id);
    enviarRespuestaExitosa(res, 200, 'Usuario eliminado correctamente');
  });
}

// Exportamos una instancia única del controlador
export default new UsuarioController();