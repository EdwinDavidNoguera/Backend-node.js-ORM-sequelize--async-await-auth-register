
import dotenv from 'dotenv'; // Para manejar variables de entorno y obligatoriamente debe estar al principio

// Importamos los módulos necesarios
import express from 'express'; // Framework de servidor
import cors from 'cors'; // Para permitir peticiones entre dominios
import { testConnection } from './app/models/indexModel.js'; // Función para probar conexión y sincronizar modelos 
import rutas from './app/routes/indexRoutes.js'; // Rutas generales , tiene la rutas de toda la aplicación
import citasCron from './app/automatizaciones/citasCron.js';// tareas automaticas relacionado a citas
import {manejadorRespuestaError, manejadorErrorDB} from './app/utils/index.js'; // Middleware global de manejo de errores


// Cargar variables de entorno desde el archivo .env
dotenv.config();
//console.log('[index.js] La clave secreta es:', process.env.JWT_SECRETA);


// Creamos una instancia de Express
const app = express();

//---MIDDLEWARE---

//Este middleware se encarga de tomar el cuerpo de las solicitudes entrantes que tengan Content-Type: application/json y convertirlo en un objeto JavaScript accesible a través de req.body.
app.use(express.json());

// Definimos el puerto (usa 3306 solo si no hay conflicto con MySQL, de lo contrario usa 3000 o 4000)
const PORT = process.env.PORT || 3500;

// Middleware para permitir solicitudes desde cualquier origen (ajustar en producción)
app.use(cors({
  origin: '*'
}));

// --- RUTAS ---

// Middleware para usar el archivo de rutas
//se encarga de usar todas las rutas definidas en el archivo de rutas.
app.use('/', rutas); // Rutas de pacientes, odontologos, etc pero sin el prefijo '/pacientes' en las rutas definidas

// --- MIDDLEWARE GLOBAL DE ERRORES ---
app.use(manejadorRespuestaError); // 
app.use(manejadorErrorDB); // Manejo específico de errores de la base de datos

// --- INICIO DEL SERVIDOR ---

//Se define el puerto
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);

  // Probar conexión y sincronizar modelos con la base de datos
  testConnection();
  // Tarea automatica para marcar las citas como ausentes
  citasCron.iniciar();
});

// Exportamos app por si se necesita en tests u otros módulos
export default app;
