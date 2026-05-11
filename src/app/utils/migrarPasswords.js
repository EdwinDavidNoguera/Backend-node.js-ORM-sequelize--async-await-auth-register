import bcrypt from 'bcrypt';
import { Usuario, sequelize } from '../models/indexModel.js'; 

const migrar = async () => {
  try {
    // 1. Conectar a la DB
    await sequelize.authenticate();
    console.log("--- Conexión establecida para migración ---");

    // 2. Buscar usuarios con contraseñas sin encriptar
    const usuarios = await Usuario.findAll();
    let contador = 0;

    for (const usuario of usuarios) {
      // Si la contraseña NO empieza con el hash de bcrypt ($2b$ o $2a$)
      if (!usuario.password.startsWith('$2')) {
        const salt = await bcrypt.genSalt(10);
        const nuevoHash = await bcrypt.hash(usuario.password, salt);

        // Actualizar el registro
        usuario.password = nuevoHash;
        await usuario.save();

        console.log(`[ENCRIPTADO] -> ${usuario.email}`);
        contador++;
      }
    }

    console.log(`\nProceso completado. Se encriptaron ${contador} usuarios.`);
  } catch (error) {
    console.error("Error en la migración:", error);
  } finally {
    // Cerrar la conexión para que el script termine solo
    await sequelize.close();
    process.exit();
  }
};

migrar();