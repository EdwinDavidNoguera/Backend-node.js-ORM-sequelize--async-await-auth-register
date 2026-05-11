import { Sequelize } from 'sequelize';
import dbConfiguracion from '../../config/dbConfiguracion.js'; // Importa la configuración de la base de datos desde el archivo de configuración

// Configuración de la conexión a la base de datos usando Sequelize
const sequelize = new Sequelize(
  dbConfiguracion.DB,
  dbConfiguracion.USER,
  dbConfiguracion.PASSWORD,
  {
    host: dbConfiguracion.HOST,
    dialect: dbConfiguracion.DIALECT,
    pool: dbConfiguracion.pool,
    logging: false, // sirven para desactivar los logs de SQL en consola, que son muy verbosos
  }
);

export default sequelize;
