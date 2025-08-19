import Usuario from '../models/usuariosModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = 'mi_clave_secreta'; // En producción esta clave debe ir en un archivo .env

//  Función asincrónica para manejar el login de los usuarios
// - Recibe email y contraseña desde el body de la petición
// - Verifica si el usuario existe en la base de datos
// - Comprueba si la contraseña ingresada coincide con la almacenada (encriptada)
// - Si todo es correcto, genera un token JWT con la información básica del usuario
// - Devuelve el token junto con algunos datos del usuario
const login = async (req, res) => {
  const { email, password } = req.body;

  console.log(" Datos recibidos en login:", { email, password }, "ATT: controlador Node.js");

  try { 
    // Buscar usuario por email en la base de datos
    const usuario = await Usuario.findOne({ where: { email } });

    // Validación: si no existe el usuario o no tiene contraseña asociada
    if (!usuario || !usuario.password) { 
      console.log(" Usuario no encontrado o sin password en DB ATT: controlador node.js");
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    // Verificar contraseña: compara la ingresada con el hash almacenado
    const passwordValida = await bcrypt.compare(password, usuario.password);

    //  Si la contraseña no es válida, se devuelve error 401
    if (!passwordValida) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    //  Generar un token JWT con:
    // - id del usuario
    // - rol del usuario
    // - clave secreta definida
    // - expiración de 1 hora
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRETA, {
      expiresIn: '1h',
    });

    // Respuesta exitosa con token y datos básicos del usuario
    res.json({ message: "Login exitoso", token, id: usuario.id, rol: usuario.rol });

  } catch (error) {
    // Manejo de errores: si ocurre algo inesperado en el proceso
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
    console.log(error);
  }
};

export default { login };
