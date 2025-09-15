import jwt from 'jsonwebtoken'; // Librería para crear y verificar tokens JWT

// Clave secreta utilizada para firmar/verificar los JWT
// IMPORTANTE: En producción debe estar en una variable de entorno segura (process.env.JWT_SECRET)
//const SECRET = 'mi_clave_secreta';  // se replaza por una variable de entorno

/**
 * Middleware de autenticación con JWT
 * Verifica que el cliente envíe un token válido en el encabezado Authorization.
 * - Si el token es válido, añade los datos del usuario al objeto `req`.
 * - Si no es válido o falta, bloquea el acceso con error 401 o 403.
 */
export default function verificarToken(req, res, next) {
  // Extraer el encabezado "Authorization" enviado por el cliente
  const authHeader = req.headers.authorization;
  //console.log('encabezado numero 1 desde verificar token', authHeader)

  // Si no se envió, el usuario no está autenticado
  if (!authHeader) {
    return res.status(401).json({ message: 'No se ha enviado el token de autenticación' });
  }

  // El encabezado debe tener formato: "Bearer <token>"
  // Ejemplo: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
  const token = authHeader.split(' ')[1]; // Separamos por espacio y obtenemos solo el token

  //console.log('encabezado 2 desde verificar token', token)
  try {
    // Verificar y decodificar el token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRETA);
    console.log('Token decodificado:', decoded);
    // Guardar la información del token (ej: id, rol, email) en `req.usuario`
    // para que pueda ser usada en las siguientes rutas/middlewares
    req.usuario = decoded; 

    next(); // Si todo es correcto, se permite continuar
  } catch (error) {
    // Si el token está mal formado, expirado o no coincide con la firma
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
}
