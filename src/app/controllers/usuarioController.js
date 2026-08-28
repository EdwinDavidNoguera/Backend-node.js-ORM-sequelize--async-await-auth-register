import UsuarioService from "../services/usuarioService.js";
import { catchAsync } from "../utils/index.js"; // Centraliza el manejo de errores asíncronos.
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";
import AppError from "../utils/errors/appError.js"; // Permite responder errores de validación.

class UsuarioController {
  /**
   * Crear un nuevo usuario (Solo credenciales)
   * POST /api/usuarios
   */
  crearUsuario = catchAsync(async (req, res) => {
    const { email, password, rol, avatar } = req.body;

    const nuevoUsuario = await UsuarioService.crearUsuario({
      email,
      password,
      rol,
      avatar,
    });

    // Ocultamos la contraseña en la respuesta final por seguridad
    const respuestaSegura = nuevoUsuario.toJSON();
    delete respuestaSegura.password;

    enviarRespuestaExitosa(res, 201, "Usuario creado exitosamente", respuestaSegura);
  });

  /**
   * Obtener todos los usuarios registrados
   * GET /api/usuarios
   */
  obtenerUsuarios = catchAsync(async (req, res) => {
    const usuarios = await UsuarioService.obtenerUsuarios();
    enviarRespuestaExitosa(res, 200, "Lista de usuarios obtenida", usuarios);
  });

  /**
   * Obtener un usuario específico por su ID
   * GET /api/usuarios/:id
   */
  obtenerUsuarioPorId = catchAsync(async (req, res) => {
    const { id } = req.params;
    const usuario = await UsuarioService.obtenerUsuarioPorId(id);
    enviarRespuestaExitosa(res, 200, "Usuario encontrado con éxito", usuario);
  });

  /**
   * Actualizar credenciales o estado del usuario
   * PATCH /api/usuarios/:id
   */
  actualizarUsuario = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    // El servicio filtra los campos permitidos antes de actualizar.
    const usuarioActualizado = await UsuarioService.actualizarUsuario(id, req.body);
    
    enviarRespuestaExitosa(res, 200, "Usuario actualizado con éxito", usuarioActualizado);
  });

  /**
   * Eliminar usuario (Desencadena borrado en cascada en la DB si aplica)
   * DELETE /api/usuarios/:id
   */
  eliminarUsuario = catchAsync(async (req, res) => {
    const { id } = req.params;
    await UsuarioService.eliminarUsuario(id);
    enviarRespuestaExitosa(res, 200, "Usuario eliminado permanentemente");
  });

  // Flujo de recuperación de contraseña.

  /**
   * Solicitar recuperación de contraseña (Genera token)
   * POST /api/usuarios/recuperar-password
   */
  solicitarRecuperacion = catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError("El correo es obligatorio", 400);
    }

    const resultado = await UsuarioService.solicitarRecuperacion(email);
    
    enviarRespuestaExitosa(res, 200, "Se ha enviado un enlace de recuperación al correo electrónico.");
  });

  /**
   * Restablecer la contraseña con un token válido
   * POST /api/usuarios/restablecer-password/:token
   */
  restablecerPassword = catchAsync(async (req, res) => {
    const { token } = req.params;
    const { nuevaPassword } = req.body;

    if (!nuevaPassword) {
      throw new AppError("La nueva contraseña es obligatoria", 400);
    }

    await UsuarioService.restablecerPassword(token, nuevaPassword);
    
    enviarRespuestaExitosa(res, 200, "La contraseña ha sido actualizada exitosamente");
  });
}

export default new UsuarioController();