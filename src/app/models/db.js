import { Sequelize } from 'sequelize';
import dbConfig from '../../config/dbConfig.js'; // Ajusta la ruta si está en otro lugar

// Configuración de la conexión a la base de datos usando Sequelize
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT,
    pool: dbConfig.pool,
    logging: false, // sirven para desactivar los logs de SQL en consola, que son muy verbosos
  }
);

export default sequelize;
