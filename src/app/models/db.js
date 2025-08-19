import { Sequelize } from 'sequelize';
import dbConfiguracion from '../../config/dbConfiguracion.js'; // Ajusta la ruta si está en otro lugar

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
