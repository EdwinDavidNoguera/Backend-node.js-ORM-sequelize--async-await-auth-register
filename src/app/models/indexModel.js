import sequelize from './db.js';
import dbConfiguracion from '../../config/dbConfiguracion.js';

// Importa los modelos de la aplicación.
import Usuario from './usuarioModel.js';
import Paciente from './pacienteModel.js';
import Odontologo from './odontologoModel.js';
import Consultorio from './consultorioModel.js';
import Servicio from './serviciosModel.js';
import Cita from './citaModel.js';
import HistoriaOdontologica from './historiaOdontologicoModel.js';
import PerfilOdontologo from './perfilOdontologoModel.js';
import HorarioOdontologo from './horarioOdontologoModel.js';
import OdontologoServicio from "./odontologoServicioModel.js";

/**
 * Prueba la conexión y sincroniza los modelos.
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(`Conexión a MariaDB establecida correctamente en ${dbConfiguracion.HOST}`);
    
    // Ajusta las tablas existentes sin eliminarlas.
    await sequelize.sync({ alter: true, force: false }); 
    console.log("Modelos sincronizados con la nueva estructura dental_life_plus2026.");
  } catch (error) {
    console.error('Error al conectar o sincronizar la DB:', error);
    process.exit(1);
  }
}

// Relaciones entre modelos.

// Usuario y paciente (1:1).
Usuario.hasOne(Paciente, { foreignKey: 'id_usuario', as: 'paciente', onDelete: 'CASCADE' });
Paciente.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Usuario y odontólogo (1:1).
Usuario.hasOne(Odontologo, { foreignKey: 'id_usuario', as: 'odontologo', onDelete: 'CASCADE' });
Odontologo.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Odontólogo y perfil (1:1).
Odontologo.hasOne(PerfilOdontologo, { foreignKey: 'id_odontologo', as: 'perfil', onDelete: 'CASCADE' });
PerfilOdontologo.belongsTo(Odontologo, { foreignKey: 'id_odontologo', as: 'odontologo' });

// Consultorio y odontólogo (1:1).
Consultorio.hasOne(Odontologo, { foreignKey: 'id_consultorio', as: 'odontologoAsignado', onDelete: 'SET NULL' });
Odontologo.belongsTo(Consultorio, { foreignKey: 'id_consultorio', as: 'consultorio' });

// Odontólogo y horarios (1:N).
Odontologo.hasMany(HorarioOdontologo, { foreignKey: 'id_odontologo', as: 'horarios', onDelete: 'CASCADE' });
HorarioOdontologo.belongsTo(Odontologo, { foreignKey: 'id_odontologo', as: 'odontologo' });

// Cita y sus relaciones principales (1:N).
// Paciente y citas.
Paciente.hasMany(Cita, { foreignKey: 'id_paciente', as: 'citas', onDelete: 'SET NULL' });
Cita.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

// Odontólogo y citas.
Odontologo.hasMany(Cita, { foreignKey: 'id_odontologo', as: 'citas', onDelete: 'SET NULL' });
Cita.belongsTo(Odontologo, { foreignKey: 'id_odontologo', as: 'odontologo' });

// Servicio y citas.
Servicio.hasMany(Cita, { foreignKey: 'id_servicio', as: 'citas', onDelete: 'SET NULL' });
Cita.belongsTo(Servicio, { foreignKey: 'id_servicio', as: 'servicio' });

// Cita e historia odontológica (1:1).
Cita.hasOne(HistoriaOdontologica, { foreignKey: 'id_cita', as: 'historia', onDelete: 'CASCADE' });
HistoriaOdontologica.belongsTo(Cita, { foreignKey: 'id_cita', as: 'cita' });

// Odontólogo y servicio (N:N).
Odontologo.belongsToMany(Servicio, {through: OdontologoServicio, foreignKey: "id_odontologo", otherKey: "id_servicio", as: "servicios", });
Servicio.belongsToMany(Odontologo, {
  through: OdontologoServicio,
  foreignKey: "id_servicio",
  otherKey: "id_odontologo",
  as: "odontologos",
});


// Exporta la conexión, los modelos y la función de sincronización.
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
  HorarioOdontologo,
  OdontologoServicio
};