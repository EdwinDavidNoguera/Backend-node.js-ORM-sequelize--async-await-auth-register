import sequelize from './db.js';
import dbConfiguracion from '../../config/dbConfiguracion.js';

// Importación de modelos
import Usuario from './usuarioModel.js';
import Paciente from './pacienteModel.js';
import Odontologo from './odontologoModel.js';
import Consultorio from './consultorioModel.js';
import Servicio from './serviciosModel.js';
import Cita from './citaModel.js';
import HistoriaOdontologica from './historiaOdontologicaModel.js';
import PerfilOdontologo from './perfilOdontologoModel.js';
import HorarioOdontologo from './horarioOdontologoModel.js';

/**
 * Función para probar la conexión y sincronizar modelos
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(`Conexión a MariaDB establecida correctamente en ${dbConfiguracion.HOST}`);
    
    // alter: true ajusta las tablas existentes sin borrarlas, 
    // ideal para esta migración con datos existentes.
    await sequelize.sync({ alter: true, force: false }); 
    console.log("Modelos sincronizados con la nueva estructura dental_life_plus2026.");
  } catch (error) {
    console.error('Error al conectar o sincronizar la DB:', error);
    process.exit(1);
  }
}

// ===============================
// RELACIONES
// ===============================

// 1. Usuario <-> Paciente (1:1)
Usuario.hasOne(Paciente, { foreignKey: 'id_usuario', as: 'paciente', onDelete: 'CASCADE' });
Paciente.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// 2. Usuario <-> Odontologo (1:1)
Usuario.hasOne(Odontologo, { foreignKey: 'id_usuario', as: 'odontologo', onDelete: 'CASCADE' });
Odontologo.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// 3. Odontologo <-> Perfil (1:1)
Odontologo.hasOne(PerfilOdontologo, { foreignKey: 'id_odontologo', as: 'perfil', onDelete: 'CASCADE' });
PerfilOdontologo.belongsTo(Odontologo, { foreignKey: 'id_odontologo', as: 'odontologo' });

// 4. Consultorio <-> Odontologo (1:1)
Consultorio.hasOne(Odontologo, { foreignKey: 'id_consultorio', as: 'odontologoAsignado', onDelete: 'SET NULL' });
Odontologo.belongsTo(Consultorio, { foreignKey: 'id_consultorio', as: 'consultorio' });

// 5. Odontologo <-> Horarios (1:N)
Odontologo.hasMany(HorarioOdontologo, { foreignKey: 'id_odontologo', as: 'horarios', onDelete: 'CASCADE' });
HorarioOdontologo.belongsTo(Odontologo, { foreignKey: 'id_odontologo', as: 'odontologo' });

// 6. CITA - Relaciones principales (1:N)
// Paciente -> Citas
Paciente.hasMany(Cita, { foreignKey: 'id_paciente', as: 'citas', onDelete: 'SET NULL' });
Cita.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

// Odontologo -> Citas
Odontologo.hasMany(Cita, { foreignKey: 'id_odontologo', as: 'citas', onDelete: 'SET NULL' });
Cita.belongsTo(Odontologo, { foreignKey: 'id_odontologo', as: 'odontologo' });

// Servicio -> Citas
Servicio.hasMany(Cita, { foreignKey: 'id_servicio', as: 'citas', onDelete: 'SET NULL' });
Cita.belongsTo(Servicio, { foreignKey: 'id_servicio', as: 'servicio' });

// 7. Cita <-> Historia Odontológica (1:1)
// En tu nuevo SQL, la historia clínica se registra por cada cita atendida
Cita.hasOne(HistoriaOdontologica, { foreignKey: 'id_cita', as: 'historia', onDelete: 'CASCADE' });
HistoriaOdontologica.belongsTo(Cita, { foreignKey: 'id_cita', as: 'cita' });


// ===============================
// EXPORTACIÓN
// ===============================
export {
  sequelize,
  testConnection,
  Usuario,
  Paciente,
  Odontologo,
  Consultorio,
  Servicio,
  Cita,
  HistoriaOdontologica,
  PerfilOdontologo,
  HorarioOdontologo
};