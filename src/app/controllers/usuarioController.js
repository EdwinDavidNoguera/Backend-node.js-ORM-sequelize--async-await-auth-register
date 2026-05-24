import UsuarioService from "../services/usuarioService.js";
import { catchAsync } from "../utils/index.js"; // Tu manejador asíncrono centralizado
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";

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
}

export default new UsuarioController();