import express from 'express';
import verificarToken from '../middlewares/verificarToken.js';
import verificarRol from '../middlewares/verificarRol.js';
import { usuarioController } from '../controllers/indexController.js';

const router = express.Router();

// ==========================================
// 🔐 RUTAS PÚBLICAS (No requieren autenticación)
// ==========================================

// Solicitar recuperación de contraseña (Genera token)
router.post('/recuperar-password', usuarioController.solicitarRecuperacion);

// Restablecer la contraseña usando el token
router.post('/restablecer-password/:token', usuarioController.restablecerPassword);

// ==========================================
// 🔒 RUTAS PROTEGIDAS (Requieren token y rol ADMIN)
// ==========================================

// Rutas para /api/usuarios/
router.route('/')
  .get(verificarToken, verificarRol("ADMIN"), usuarioController.obtenerUsuarios)     // Obtener todos los usuarios
  .post(verificarToken, verificarRol("ADMIN"), usuarioController.crearUsuario);      // Crear un nuevo usuario

// Rutas para /api/usuarios/:id
router.route('/:id')
  .get(verificarToken, verificarRol("ADMIN"), usuarioController.obtenerUsuarioPorId)   // Obtener un usuario por ID
  .put(verificarToken, verificarRol("ADMIN"), usuarioController.actualizarUsuario)     // Actualizar usuario por ID
  .delete(verificarToken, verificarRol("ADMIN"), usuarioController.eliminarUsuario);   // Eliminar usuario por ID

export default router;