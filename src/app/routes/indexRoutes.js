// Importamos el Router de Express para organizar las rutas en módulos
import { Router } from 'express';

// Importas las rutas específicas de cada recurso del sistema
import pacienteRoutes from './pacientesRoutes.js';
import odontologoRoutes from './odontologosRoutes.js';
import usuarioRoutes from './usuariosRoutes.js';
import authRoutes from './authRoutes.js';
import servicioRoutes from './srviciosRoutes.js';
import citaRoutes from './citasRoutes.js';
import historialRoutes from './historialOdontologicoRoutes.js';
import consultorioRoutes from './consultorioOdontologicoRoutes.js';
import tratamientoRoutes from './tratamientoOdontologicoRoutes.js';
import historialPDFRoutes from './historialPDFRoutes.js';

// Creamos una instancia del enrutador
const router = Router();

// rutas bajo un prefijo correspondiente
router.use('/pacientes', pacienteRoutes);       // Rutas relacionadas con los pacientes
router.use('/odontologos', odontologoRoutes);   // Rutas relacionadas con los odontólogos
router.use('/usuarios', usuarioRoutes);         // Rutas relacionadas con los usuarios en general
router.use('/servicios', servicioRoutes);       // Rutas relacionadas con los servicios
router.use('/citas', citaRoutes);               // Rutas relacionadas con las citas
router.use('/login', authRoutes);               // Ruta para autenticación (login)
router.use('/historiales', historialRoutes);    // Rutas relacionadas con los historiales odontológicos
router.use('/consultorios', consultorioRoutes); // Rutas relacionadas con los consultorios
router.use('/tratamientos', tratamientoRoutes); // Rutas relacionadas con los tratamientos odontológicos
router.use('/historial-pdf', historialPDFRoutes); // Ruta para descargar historiales en PDF
// Ruta principal (GET /)
router.get('/', (req, res) => {
  res.send('Hola express desde rutas separadas 🚀, estas son las rutas generales');
});

// Exportamos el enrutador para que pueda ser utilizado en el archivo principal de la aplicación
export default router;
