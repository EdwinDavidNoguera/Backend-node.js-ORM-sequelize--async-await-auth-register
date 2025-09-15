import sequelize from './db.js';
import dbConfiguracion from '../../config/dbConfiguracion.js';


/**
 * Este archivo tiene como propósito:
 * Inicializar Sequelize
 * Probar la conexión
 * Importar modelos
 * Exportar la instancia de Sequelize y los modelos
 */

// Función para probar la conexión y sincronizar modelos
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(`Conexión a la base de datos de mySQL establecida correctamente. y corriendo en ${dbConfiguracion.HOST}`);
    await sequelize.sync({ alter: true }); // en producion tener cuidado con force:true porque elimina y recrea las tablas
    console.log("Modelos sincronizados con la base de datos.");
  } catch (error) {
    console.error('No se pudo conectar a la base de datos de mySQL:', error);
  }
}

// Asignación de los modelos para exportarlos
import Usuario from './usuariosModel.js';
import Paciente from './pacientesModel.js';
import Odontologo from './odontologosModel.js';
import Consultorio from './consultorioOdontologicoModel.js';
import Servicio from './serviciosModel.js';
import Cita from './citasModel.js';
import Historial from './historialOdontologicoModel.js';
import Consulta from './consultaOdontologicaModel.js';
import Tratamiento from './tratamientoOdontologicoModel.js';
import Horario from './horarioOdontologoModel.js';

// ===============================
// RELACIONES ENTRE MODELOS
// ===============================

// Usuario <-> Paciente (1:1)
// al borrar un usuario, se borra su paciente asociado
Usuario.hasOne(Paciente, { foreignKey: 'id', as: 'paciente', onDelete: 'CASCADE' });
Paciente.belongsTo(Usuario, { foreignKey: 'id', as: 'usuario' });

// Usuario <-> Odontologo (1:1)
// al borrar un usuario, se borra su odontologo asociado
Usuario.hasOne(Odontologo, { foreignKey: 'id', as: 'odontologo', onDelete: 'CASCADE' });
Odontologo.belongsTo(Usuario, { foreignKey: 'id', as: 'usuario' });

// Paciente <-> Cita (1:N)
//al eliminar un paciente, se eliminan sus citas asociadas
Paciente.hasMany(Cita, { foreignKey: 'pacienteId', as: 'citas', onDelete: 'CASCADE' });
Cita.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

// Odontologo <-> Cita (1:N)
// al eliminar un odontologo, se eliminan sus citas asociadas
Odontologo.hasMany(Cita, { foreignKey: 'odontologoId', as: 'citas', onDelete: 'CASCADE' });
Cita.belongsTo(Odontologo, { foreignKey: 'odontologoId', as: 'odontologo' });

// Servicio <-> Cita (1:N)
// al eliminar un servicio, las citas que tenian ese servicio quedan con servicioId en null
Servicio.hasMany(Cita, { foreignKey: 'servicioId', as: 'citas', onDelete: 'SET NULL' });
Cita.belongsTo(Servicio, { foreignKey: 'servicioId', as: 'servicio' });

// Paciente <-> Historial (1:1)
// un paciente tiene un historial, y un historial pertenece a un paciente.
// la fk va en historial porque este depende de paciente y no al reves
Paciente.hasOne(Historial, { foreignKey: 'pacienteId', as: 'historial', onDelete: 'CASCADE' });
Historial.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

// Historial <-> Consulta (1:N)
//un historial puede tener varias consultas, y cada consulta pertenece a un historial.
// la fk ve en consulta porque pertenece a los muchon
// al eliminar un historial, no se eliminan sus consultas asociadas
Historial.hasMany(Consulta, { foreignKey: 'historialId', as: 'consultas' , onDelete: 'SET NULL' });
Consulta.belongsTo(Historial, { foreignKey: 'historialId', as: 'historial' });

// Cita <-> Consulta (1:1)
// la fk va en consulta porque esta depende de cita y no al reves
Cita.hasOne(Consulta, { foreignKey: 'citaId', as: 'consulta', onDelete: 'SET NULL' });
Consulta.belongsTo(Cita, { foreignKey: 'citaId', as: 'cita' });

// Consulta <-> Tratamiento (1:N)
// la fk va en tratamiento porque es el lado de los muchos
Consulta.hasMany(Tratamiento, { foreignKey: 'consultaId', as: 'tratamientos' });
Tratamiento.belongsTo(Consulta, { foreignKey: 'consultaId', as: 'consulta' });

// Odontologo <-> Consultorio (1:N) 
Consultorio.hasOne(Odontologo, {foreignKey: "consultorioId", as: "odontologos", onDelete: "SET NULL"});
Odontologo.belongsTo(Consultorio, {foreignKey: "consultorioId", as: "consultorio"});

// Odontologo <-> Horario (1:N)
Odontologo.hasMany(Horario, { foreignKey: "odontologoId", as: "horarios", onDelete: "CASCADE" });
Horario.belongsTo(Odontologo, { foreignKey: "odontologoId", as: "odontologo" });


// ===============================
// EXPORTACIÓN DE MODELOS Y SEQUELIZE
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
  Historial,
  Consulta,
  Tratamiento,
  Horario
};