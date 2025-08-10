import Usuario from '../models/usuariosModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = 'mi_clave_secreta'; // En producción se pone en un archivo .env

//esta funcion asincrona maneja el login de los usuarios
//recibe el email y la contraseña del usuario, verifica si existe y si la contraseña es correcta
//si todo es correcto, genera un token y lo devuelve
const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("📥 Datos recibidos en login:", { email, password },"ATT: controlador Node.js");


  try { 
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario || !usuario.password) { // si no existe el usuario
      console.log("✖️✖️ Usuario no encontrado o sin password en DB ATT: controlador node.js");
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    // Verifica la contraseña
     // Compara la contraseña ingresada con la almacenada en la base de datos
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
      
    }


    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, SECRET, {
      expiresIn: '1d',
    });

    res.json({ message: "Login exitoso", token, id: usuario.id, rol: usuario.rol });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
    console.log(error);
  }
};

export default {login};