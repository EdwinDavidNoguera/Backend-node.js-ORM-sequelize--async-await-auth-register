import express from 'express';
import verificarToken from '../middlewares/verificarToken.js';
import verificarRol from '../middlewares/verificarRol.js';
import {usuarioController} from '../controllers/indexController.js';
import e from 'express';
const router = express.Router();

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
