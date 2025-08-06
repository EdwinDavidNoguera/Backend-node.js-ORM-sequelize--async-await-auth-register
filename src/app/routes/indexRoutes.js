import { Router } from 'express';

// Importas las rutas específicas
import pacienteRoutes from './pacientesRoutes.js';
import odontologoRoutes from './odontologosRoutes.js';
import usuarioRoutes from './usuariosRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

// Aquí montas cada grupo de rutas bajo un prefijo
router.use('/pacientes', pacienteRoutes);
router.use('/odontologos', odontologoRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/login', authRoutes);


// Ruta principal
router.get('/', (req, res) => {
  res.send('Hola express desde rutas separadas 🚀, estas son las rutas generales');
});

export default router;
