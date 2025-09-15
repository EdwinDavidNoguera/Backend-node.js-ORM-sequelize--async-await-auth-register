import express from 'express';
import UsuarioController from '../controllers/usuarioController.js';
import e from 'express';
const router = express.Router();

// Rutas para /api/usuarios/
router.route('/')
  .get(UsuarioController.obtenerUsuarios)     // Obtener todos los usuarios
  .post(UsuarioController.crearUsuario);      // Crear un nuevo usuario

// Rutas para /api/usuarios/:id
router.route('/:id')
  .get(UsuarioController.obtenerUsuarios)   // Obtener un usuario por ID
  .put(UsuarioController.actualizarUsuario)     // Actualizar usuario por ID
  .delete(UsuarioController.eliminarUsuario);   // Eliminar usuario por ID

export default router;
