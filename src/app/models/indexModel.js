import sequelize  from  './db.js'; // importamos Sequelize
import dbConfig from '../../config/dbConfig.js'; // Importamos la configuración de la base de datos

// 1. Crear una instancia de Sequelize con los datos de conexión, los cuales estan en dbConfig

// este modelo Este archivo debería encargarse de:

// Inicializar la instancia de Sequelize.

// Probar la conexión a la base de datos.

// Importar los modelos ya definidos desde sus propios archivos.

// Exportar la instancia de Sequelize y los modelos importados.
// src/app/models/index.js


// 1. Crear una instancia de Sequelize con los datos de conexión

// test para verificar la conexión a la base de datos
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(`Conexión a la base de datos de mySQL establecida correctamente. y corriendo en ${dbConfig.HOST}`);

    // 👇 sincronizar los modelos
    await sequelize.sync(); // o force: true si quieres borrar y recrear las tablas
    console.log("✅ Modelos sincronizados con la base de datos.");

  } catch (error) {
    console.error('No se pudo conectar a la base de datos de mySQL:', error);
  }
}

// 2. Importar los modelos (estos archivos contendrán la definición de cada modelo)
//    Importamos con un alias (ej. 'UsuarioModel') para evitar conflictos de nombres
//    y luego asignamos el modelo final al nombre simple (ej. 'Usuario').
//    Cada uno de estos archivos *debe* exportar su modelo por defecto.
import UsuarioModel from './usuariosModel.js';
import OdontologoModel from './odontologosModel.js';
import PacienteModel from './pacientesModel.js';

// Asignamos los modelos importados a variables locales para exportarlos
const Usuario = UsuarioModel;
const Odontologo = OdontologoModel;
const Paciente = PacienteModel;

// 3. (Opcional pero recomendado para centralizar relaciones)
//    Definir relaciones entre modelos aquí después de que todos estén importados.
//    Asegúrate de que tus modelos individuales NO definan relaciones si las centralizas aquí.
//    Si ya las defines dentro de cada modelo (como tienes Paciente.belongsTo(Usuario)),
//    entonces no es necesario repetirlas aquí.

// Ejemplo de definición de relaciones aquí si NO están en los archivos de modelo individuales:
// Usuario.hasOne(Paciente, { foreignKey: 'id', as: 'paciente' });
// Paciente.belongsTo(Usuario, { foreignKey: 'id', as: 'usuario' });
// ... y así para Odontologo, Citas, etc.

// 4. Sincronizar modelos con la base de datos (generalmente se hace en src/index.js principal de la app)
//    NO lo hagas aquí a menos que tengas una razón muy específica.
//    sequelize.sync({ force: false }).then(() => console.log('Base de datos sincronizada'));

// 5. Exportar sequelize y los modelos
export {
  sequelize,
  testConnection,
  Usuario,
  Odontologo,
  Paciente
};