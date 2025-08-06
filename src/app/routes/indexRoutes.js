// Importamos el Router de Express para organizar las rutas en módulos
import { Router } from 'express';

// Importas las rutas específicas de cada recurso del sistema
import pacienteRoutes from './pacientesRoutes.js';
import odontologoRoutes from './odontologosRoutes.js';
import usuarioRoutes from './usuariosRoutes.js';
import authRoutes from './authRoutes.js';

// Creamos una instancia del enrutador
const router = Router();

// Montamos cada grupo de rutas bajo un prefijo correspondiente
router.use('/pacientes', pacienteRoutes);       // Rutas relacionadas con los pacientes
router.use('/odontologos', odontologoRoutes);   // Rutas relacionadas con los odontólogos
router.use('/usuarios', usuarioRoutes);         // Rutas relacionadas con los usuarios en general
router.use('/login', authRoutes);               // Ruta para autenticación (login)

// Ruta principal (GET /)
router.get('/', (req, res) => {
  res.send('Hola express desde rutas separadas 🚀, estas son las rutas generales');
});

// Exportamos el enrutador para que pueda ser utilizado en el archivo principal de la aplicación
export default router;
