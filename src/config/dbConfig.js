const dbConfig = {
  HOST: 'localhost',         // Dirección del servidor de base de datos, en este caso es local
  USER: 'root',              // Usuario de la base de datos
  PASSWORD: '',              // Contraseña de ese usuario (modifícalo si usas una)
  DB: 'dental_life_node.js + orm', // El nombre exacto de la base de datos en MariaDB
  DIALECT: 'mysql',  
  pool: { //conjunto de conecciones para optimizar el rendimiento
    max: 5,          // Máximo número de conexiones en el pool
    min: 0,          // Mínimo número de conexiones
    acquire: 30000,  // Tiempo máximo que Sequelize intentará conectarse (ms)
    idle: 10000      // Tiempo de inactividad antes de cerrar una conexión (ms)
  }
};
export default dbConfig; // Exporta la configuración para que pueda ser utilizada en otros archivos
