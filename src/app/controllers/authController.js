import Usuario from '../models/usuariosModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = 'mi_clave_secreta'; // En producción pon esto en un archivo .env

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

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