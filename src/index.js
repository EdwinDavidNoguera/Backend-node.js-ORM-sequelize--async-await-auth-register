import express from 'express';
import indexRoutes from './app/controllers/models/routes/indexRoutes.js';
import cors from 'cors';
import {testConnection}  from './app/controllers/models/index.js';


console.log('Servicdor corriendo...'); // index.js
const app = express();
const PORT = process.env.PORT || 3500;

app.use(express.json());
app.use(cors({
  origin: '*', // Permitir todos los orígenes por simplicidad, ajustar según sea necesario
}));

// midedleware para manejar rutas en lugar de ponerlas directamente en el index.js
app.use('/', indexRoutes);
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  testConnection(); // Verificar conexión a la base de datos al iniciar el servidor
});
export default app; // index.js si exportamos asi no es necesario importer entre llaves en otros archivos
// export { app }; // index.js si exportamos asi es necesario importar entre llaves en otros archivos