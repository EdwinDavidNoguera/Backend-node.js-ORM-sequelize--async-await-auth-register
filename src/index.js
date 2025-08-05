// Importamos los módulos necesarios
import express from 'express'; // Framework de servidor
import cors from 'cors'; // Para permitir peticiones entre dominios
import { testConnection } from './app/models/index.js'; // Función para probar conexión y sincronizar modelos
import pacientesRoutes from './app/routes/pacientesRoutes.js'; // Rutas de pacientes
import odontologosRoutes from './app/routes/odontologosRoutes.js'; // Rutas de odontólogos
import usuariosRoutes from './app/routes/usuariosRoutes.js'; // Rutas de usuarios 

//en los modolos propios se usan .js , pero en modulos de terceros como express y cors no es necesario usar .js

// Creamos una instancia de Express
const app = express();

// Definimos el puerto (usa 3306 solo si no hay conflicto con MySQL, de lo contrario usa 3000 o 4000)
const PORT = process.env.PORT || 3500;

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Middleware para permitir solicitudes desde cualquier origen (ajustar en producción)
app.use(cors({
  origin: '*'
}));

// Middleware para usar el archivo de rutas
//Esto pre-asigna el prefijo /pacientes a todas las rutas internas del pacientesRoutes.
app.use('/pacientes', pacientesRoutes); // Rutas de pacientes pero sin el prefijo '/pacientes' en las rutas definidas
app.use('/odontologos', odontologosRoutes); // Rutas de odontologos pero sin el prefijo '/odontologos' en las rutas definidas
app.use('/usuarios', usuariosRoutes); // Rutas de usuarios pero sin el prefijo '/usuarios' en las rutas definidas

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);

  // Probar conexión y sincronizar modelos con la base de datos
  testConnection();
});

// Exportamos app por si se necesita en tests u otros módulos
export default app;
