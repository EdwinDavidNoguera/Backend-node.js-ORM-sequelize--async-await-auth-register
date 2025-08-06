import jwt from 'jsonwebtoken';

const SECRET = 'mi_clave_secreta'; // Se recomienda usar process.env.JWT_SECRET con dotenv

export default function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token no enviado' });
  }

  const token = authHeader.split(' ')[1]; // Extrae el token después de "Bearer"

  try {
    const decoded = jwt.verify(token, SECRET); // Decodifica el token
    req.usuario = decoded; // Guarda los datos del token (id, rol, etc.)
    next(); // Continúa a la ruta protegida
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
}
