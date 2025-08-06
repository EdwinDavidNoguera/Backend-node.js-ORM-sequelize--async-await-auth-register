// Importa la instancia de Sequelize desde el archivo db.js (configurada con parámetros de conexión)
import sequelize from './db.js'; //esto se hizo para evitar problemas de circularidad

// Importa la configuración de la base de datos (host, usuario, contraseña, etc.)
import dbConfig from '../../config/dbConfig.js';

// Este archivo tiene como propósito:
// ✅ Inicializar Sequelize
// ✅ Probar la conexión
// ✅ Importar modelos
// ✅ Exportar la instancia de Sequelize y los modelos

// Función asincrónica para probar la conexión a la base de datos
async function testConnection() {
  try {
    // Intenta autenticar la conexión con la base de datos, solo para verificar que todo esté correcto
    await sequelize.authenticate();
    console.log(`Conexión a la base de datos de mySQL establecida correctamente. y corriendo en ${dbConfig.HOST}`);

    // Sincroniza todos los modelos con la base de datos
    await sequelize.sync(); 
    console.log("✅ Modelos sincronizados con la base de datos.");

  } catch (error) {
    // Captura y muestra cualquier error de conexión
    console.error('No se pudo conectar a la base de datos de mySQL:', error);
  }
}

// Importa los modelos individuales definidos en archivos separados
import UsuarioModel from './usuariosModel.js';        // Modelo de usuarios
import OdontologoModel from './odontologosModel.js';  // Modelo de odontólogos
import PacienteModel from './pacientesModel.js';      // Modelo de pacientes

// Asignacion de los modelos para exportarlos
const Usuario = UsuarioModel;
const Odontologo = OdontologoModel;
const Paciente = PacienteModel;

// (Opcional) Aquí podría definir las relaciones entre modelos si no se fefinen en los modelos individuales
// Ejemplo 
// Usuario.hasOne(Paciente, { foreignKey: 'id', as: 'paciente' });
// Paciente.belongsTo(Usuario, { foreignKey: 'id', as: 'usuario' });
// Similar para Odontologo, Citas, etc.

// ⚠️ La sincronización con la base de datos generalmente debe hacerse desde el archivo src/index.js
// sequelize.sync({ force: false }).then(() => console.log('Base de datos sincronizada')); sin embargo 
// se debe tener cuidado con el uso de { force: true } ya que elimina y recrea las tablas y se acomulan llaves 
// primarias en la DB, lo que puede causar problemas si se usa en producción.

// Exporta la instancia de sequelize y los modelos para usarlos en otros módulos del proyecto
export {
  sequelize,       // Instancia de conexión Sequelize
  testConnection,  // Función para probar conexión y sincronización
  Usuario,         // Modelo Usuario
  Odontologo,      // Modelo Odontologo
  Paciente         // Modelo Paciente
};
