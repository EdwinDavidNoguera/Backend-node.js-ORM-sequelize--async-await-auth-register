
import dotenv from 'dotenv'; // Para manejar variables de entorno y obligatoriamente debe estar al principio

// Importamos los módulos necesarios
import express from 'express'; // Framework de servidor
import cors from 'cors'; // Para permitir peticiones entre dominios
import { testConnection } from './app/models/indexModel.js'; // Función para probar conexión y sincronizar modelos 
import rutas from './app/routes/indexRoutes.js'; // Rutas generales , tiene la rutas de toda la aplicación


// Cargar variables de entorno desde el archivo .env
dotenv.config();
//console.log('[index.js] La clave secreta es:', process.env.JWT_SECRETA);


// Creamos una instancia de Express
const app = express();

//---MIDDLEWARE---

//Este middleware se encarga de tomar el cuerpo de las solicitudes entrantes que tengan Content-Type: application/json y convertirlo en un objeto JavaScript accesible a través de req.body.
app.use(express.json());

// Middleware para registrar el cuerpo crudo y encabezados que envia Rest Client
// app.use((req, res, next) => {
//   let data = '';
//   req.on('data', chunk => {
//     data += chunk;
//   });
//   req.on('end', () => {
//     console.log('Cuerpo crudo de la solicitud:', JSON.stringify(data));
//     console.log('Encabezados de la solicitud:', req.headers);
//     next();
//   });
// });










// Definimos el puerto (usa 3306 solo si no hay conflicto con MySQL, de lo contrario usa 3000 o 4000)
const PORT = process.env.PORT || 3500;

// Middleware para permitir solicitudes desde cualquier origen (ajustar en producción)
app.use(cors({
  origin: '*'
}));

// --- RUTAS ---

// Middleware para usar el archivo de rutas
//se encarga de usar todas las rutas definidas en el archivo de rutas.
app.use('/', rutas); // Rutas de pacientes pero sin el prefijo '/pacientes' en las rutas definidas

// --- INICIO DEL SERVIDOR ---

//Se define el puerto
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);

  // Probar conexión y sincronizar modelos con la base de datos
  testConnection();
});

// Exportamos app por si se necesita en tests u otros módulos
export default app;
