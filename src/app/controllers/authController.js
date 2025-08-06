import Usuario from '../models/usuariosModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = 'mi_clave_secreta'; // En producción pon esto en un archivo .env

//esta funcion asincrona maneja el login de los usuarios
//recibe el email y la contraseña del usuario, verifica si existe y si la contraseña es correcta
//si todo es correcto, genera un token y lo devuelve
const login = async (req, res) => {
  const { email, password } = req.body;

  try { 
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) { // si no existe el usuario
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    // Verifica la contraseña
     // Compara la contraseña ingresada con la almacenada en la base de datos
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, SECRET, {
      expiresIn: '1d',
    });

    res.json({ message: "Login exitoso", token, id: usuario.id, rol: usuario.rol });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};

export default {login};