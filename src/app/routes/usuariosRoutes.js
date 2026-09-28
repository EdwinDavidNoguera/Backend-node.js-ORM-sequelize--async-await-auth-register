import express from 'express';
import verificarToken from '../middlewares/verificarToken.js';
import verificarRol from '../middlewares/verificarRol.js';
import { usuarioController } from '../controllers/indexController.js';

const router = express.Router();

// Rutas públicas: no requieren autenticación.

// Solicita la recuperación de contraseña y genera un token temporal.
router.post('/recuperar-password', usuarioController.solicitarRecuperacion);

// Restablece la contraseña mediante un token válido.
router.post('/restablecer-password/:token', usuarioController.restablecerPassword);

// Rutas protegidas: requieren token y rol ADMIN.

// Operaciones sobre la colección de usuarios.
router.route('/')
  .get(verificarToken, verificarRol("ADMIN"), usuarioController.obtenerUsuarios)     // Obtiene todos los usuarios.
  .post(verificarToken, verificarRol("ADMIN"), usuarioController.crearUsuario);      // Crea un usuario.

// Autoservicio: el usuario se identifica exclusivamente mediante el token.
router.route('/mi-cuenta')
  .get(verificarToken, verificarRol("PACIENTE"), usuarioController.obtenerMiCuenta)
  .patch(verificarToken, verificarRol("PACIENTE"), usuarioController.actualizarMiCuenta);

// Operaciones sobre un usuario identificado por su ID.
router.route('/:id')
  .get(verificarToken, verificarRol("ADMIN"), usuarioController.obtenerUsuarioPorId)   // Obtiene un usuario.
  .put(verificarToken, verificarRol("ADMIN"), usuarioController.actualizarUsuario)     // Actualiza un usuario.
  .delete(verificarToken, verificarRol("ADMIN"), usuarioController.eliminarUsuario);   // Elimina un usuario.

export default router;