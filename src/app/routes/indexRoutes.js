import { Router } from 'express';

const router = Router();

// Ruta principal
router.get('/', (req, res) => {
  res.send('Hola express desde rutas separadas 🚀, estas son las rutas generales');
});

export default router;
