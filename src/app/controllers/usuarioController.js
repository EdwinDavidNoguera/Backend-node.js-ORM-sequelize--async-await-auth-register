import UsuarioService from "../services/usuarioService.js";
import { catchAsync } from "../utils/index.js"; // Tu manejador asíncrono centralizado
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";
import AppError from "../utils/errors/appError.js"; // Importamos AppError por si falta algún dato en el body

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
    
    // Pasamos el req.body directamente ya que el servicio filtra los campos permitidos
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

  // ==========================================
  // 🔐 FLUJO DE RECUPERACIÓN DE CONTRASEÑA
  // ==========================================

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
    
    // Pasamos el "resultado" que temporalmente contiene el token para poder probar en Postman
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
    
    // Como no devolvemos data, omitimos el cuarto parámetro
    enviarRespuestaExitosa(res, 200, "La contraseña ha sido actualizada exitosamente");
  });
}

export default new UsuarioController();