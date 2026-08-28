import Usuario from '../models/usuarioModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = 'mi_clave_secreta'; // La clave de firma debe configurarse mediante variables de entorno.

// Procesa el inicio de sesión y devuelve un token con los datos básicos del usuario.
const login = async (req, res) => {
  const { email, password } = req.body;

  try { 
    // Busca el usuario por correo electrónico.
    const usuario = await Usuario.findOne({ where: { email } });

    // Rechaza la solicitud si el usuario no existe o no tiene contraseña asociada.
    if (!usuario || !usuario.password) { 
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    // Comprueba que la cuenta esté activa.
    if (!usuario.activo) {
      return res.status(403).json({ message: "Esta cuenta está desactivada. Contacte al administrador." });
    }

    // Compara la contraseña recibida con el hash almacenado.
    const passwordValida = await bcrypt.compare(password, usuario.password);

    // Rechaza las credenciales inválidas.
    if (!passwordValida) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    // Genera un token JWT con el identificador y el rol del usuario. Usamos clave alojada en .env
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRETA, {
      expiresIn: '3h',
    });

    // Devuelve el token y los datos básicos del usuario.
    res.json({ 
      message: "Login exitoso", 
      token, 
      user: {
        id: usuario.id, 
        rol: usuario.rol,
        email: usuario.email,
        avatar: usuario.avatar
      }
    });

  } catch (error) {
    // Registra y comunica cualquier error inesperado del proceso.
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
    console.log( "Error en login:", error);
  }
};

export default { login };
