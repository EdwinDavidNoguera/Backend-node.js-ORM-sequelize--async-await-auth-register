
import dotenv from 'dotenv'; // Carga las variables de entorno antes de inicializar la aplicación.

import express from 'express'; // Framework del servidor.
import cors from 'cors'; // Permite solicitudes entre dominios.
import { testConnection } from './app/models/indexModel.js'; // Prueba la conexión y sincroniza los modelos.
import rutas from './app/routes/indexRoutes.js'; // Rutas generales de la aplicación.
// import citasCron from './app/automatizaciones/citasCron.js'; // Tareas automáticas relacionadas con citas.
import {manejadorRespuestaError, manejadorErrorDB} from './app/utils/index.js'; // Middlewares globales de errores.


// Carga las variables de entorno desde .env.
dotenv.config();

// Crea la instancia principal de Express.
const app = express();

// Middlewares de la aplicación.

// Procesa los cuerpos de las solicitudes con contenido JSON.
app.use(express.json());
// Expone los archivos cargados mediante la ruta pública /uploads.
app.use('/uploads', express.static('src/app/uploads'));

// Define el puerto del servidor.
const PORT = process.env.PORT || 3500;

// Permite solicitudes desde cualquier origen; debe restringirse en producción.
app.use(cors({
  origin: '*'
}));

// Registra las rutas de la aplicación.
app.use('/', rutas);

// Registra los middlewares globales de errores.
app.use(manejadorRespuestaError);
app.use(manejadorErrorDB); // Maneja los errores específicos de la base de datos.

// Inicia el servidor.
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);

  // Comprueba la conexión y sincroniza los modelos.
  testConnection();
  // Inicia la tarea automática para marcar las citas como ausentes.
  // citasCron.iniciar();
});

// Exporta la aplicación para pruebas u otros módulos.
export default app;
