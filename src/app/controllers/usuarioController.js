import UsuarioService from '../services/usuarioService.js';
import { AppError, catchAsync, manejadorRespuestaExitosa } from '../utils/index.js';

/**
 * Controlador para operaciones CRUD de usuarios.
 * Utiliza  las utilidades catchAsync para manejar errores con el errorHandler personalizado.
 */
class UsuarioController {

  // Crear un nuevo usuario
  crearUsuario = catchAsync(async (req, res) => {
    const nuevoUsuario = await UsuarioService.crearUsuario(req.body);
    res.status(201).json({
      status: 201,
      message: 'Usuario creado correctamente',
      data: nuevoUsuario,
      errors: false
    });
  });

  // Obtener todos los usuarios
  obtenerUsuarios = catchAsync(async (req, res) => {
    const usuarios = await UsuarioService.obtenerUsuarios();
    manejadorRespuestaExitosa(res, 200, 'Usuarios obtenidos con exito', usuarios )
  });

  // Obtener un usuario específico por su ID
  obtenerUsuario = catchAsync(async (req, res) => {
    const usuario = await UsuarioService.obtenerUsuarioPorId(req.params.id);
    
    if (!usuario) throw new AppError("Usuario no encontrado", 404);
    
    res.status(200).json({ status: 200, data: usuario });
  });

  // Actualizar un usuario existente
  actualizarUsuario = catchAsync(async (req, res) => {
    const usuarioActualizado = await UsuarioService.actualizarUsuario(req.params.id, req.body);
    res.status(200).json({
      status: 200,
      message: 'Usuario actualizado correctamente',
      data: usuarioActualizado
    });
  });

  // Eliminar un usuario
  eliminarUsuario = catchAsync(async (req, res) => {
    await UsuarioService.eliminarUsuario(req.params.id);
    res.status(200).json({
      status: 200,
      message: 'Usuario eliminado correctamente',
      errors: false
    });
  });
}

// Exportamos una instancia única del controlador
export default new UsuarioController();
