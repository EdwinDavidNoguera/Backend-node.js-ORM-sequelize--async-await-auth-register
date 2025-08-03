import { Sequelize } from 'sequelize'; // importamos Sequelize
import dbConfig from '../../../config/dbConfig.js'; // importamos nuestra config

// 1. Crear una instancia de Sequelize con los datos de conexión
const sequelize = new Sequelize(
  dbConfig.DB,         // nombre base de datos
  dbConfig.USER,       // usuario
  dbConfig.PASSWORD,   // contraseña
  {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT, // "mariadb"
    pool: dbConfig.pool,       // configuración del pool de conexiones
    logging: false,            // desactiva los logs de SQL (puedes poner true para verlos)
  }
);


//test para verificar la conexión a la base de datos
// Esta función se puede llamar en index.js para verificar la conexión
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

//testConnection(); // Llamamos a la función para probar la conexión

// // 2. Importamos cada modelo (estos aún los vamos a crear)
// import Usuario from './usuario.model.js';
// import Odontologo from './odontologo.model.js';
// import Paciente from './paciente.model.js';

// // 3. Inicializamos cada modelo con la conexión (sequelize)
// const models = {
//   Usuario: Usuario(sequelize),       // crea el modelo Usuario con conexión a DB
//   Odontologo: Odontologo(sequelize), // crea el modelo Odontologo
//   Paciente: Paciente(sequelize)      // crea el modelo Paciente
// };

// // 4. Definir relaciones entre modelos (si hay claves foráneas)
// models.Usuario.hasOne(models.Odontologo, { foreignKey: 'usuario_id' });
// models.Usuario.hasOne(models.Paciente, { foreignKey: 'usuario_id' });

// models.Odontologo.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
// models.Paciente.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });

// Exportamos sequelize para poder hacer sync() luego en index.js
export { sequelize, testConnection }; // exportamos la instancia de sequelize y la función de prueba
// export default models;
