import jwt from 'jsonwebtoken'; // Importa el módulo jsonwebtoken para manejar JWTs

// Se define una clave secreta para firmar y verificar los tokens JWT
// Nota: en producción es mejor usar variables de entorno (process.env.JWT_SECRET)
const SECRET = 'mi_clave_secreta'; 

// Middleware para verificar el token JWT en las solicitudes protegidas
export default function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization; // Obtiene el encabezado Authorization de la solicitud

  // Si no se envió el encabezado, retorna un error 401 (no autorizado)
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no enviado' });
  }

  // El encabezado debe tener el formato "Bearer <token>", se extrae el token
  const token = authHeader.split(' ')[1]; 

  try {
    // Verifica y decodifica el token usando la clave secreta
    const decoded = jwt.verify(token, SECRET); 

    // Se guarda el contenido del token (ej. id, rol) en la solicitud para usarlo después
    req.usuario = decoded; 

    next(); // Si todo está bien, continúa con la siguiente función en la cadena de middlewares
  } catch (error) {
    // Si el token no es válido o está expirado, retorna un error 403 (prohibido)
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
}
