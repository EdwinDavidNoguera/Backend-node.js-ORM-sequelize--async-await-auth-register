import { Sequelize } from 'sequelize';
import dbConfig from '../../config/dbConfig.js'; // Ajusta la ruta si está en otro lugar

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT,
    pool: dbConfig.pool,
    logging: false, // Quita logs SQL si no los necesitas
  }
);

export default sequelize;
