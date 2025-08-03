import express from 'express';
import cors from 'cors';


console.log('Servicdor corriendo...'); // index.js
const app = express();
const PORT = process.env.PORT || 3500;

app.use(express.json());
app.use(cors({
  origin: '*', // Permitir todos los orígenes por simplicidad, ajustar según sea necesario
}));

// Ruta de ejemplo, las rutas reales se definirán en otros archivos
app.get('/', (req, res) => {
  res.send('Hola express!, ahora con soporte para módulos ES6 y nodemon para desarrollo.');
});
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
export default app; // index.js