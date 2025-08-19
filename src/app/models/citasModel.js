import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";
import Paciente from "./pacientesModel.js";
import Servicio from "./serviciosModel.js";
import Odontologo from "./odontologosModel.js";

// Definición del modelo "Cita", que representa una cita odontológica en el sistema
class Cita extends Model {}

// Inicialización del modelo con sus atributos y restricciones
Cita.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true, // Llave primaria
      autoIncrement: true, // Incremento automático
    },

    pacienteId: {
      type: DataTypes.INTEGER,
      allowNull: false, // No se permite nulo, cada cita debe tener un paciente asociado
      references: { model: Paciente, key: "id" }, // Relación con la tabla "pacientes"
    },

    odontologoId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Obligatorio: cada cita debe asignarse a un odontólogo
      references: { model: Odontologo, key: "id" }, // Relación con la tabla "odontologos"
    },

    servicioId: {
      type: DataTypes.INTEGER,
      allowNull: false, // Obligatorio: cada cita debe estar asociada a un servicio
      references: { model: Servicio, key: "id" }, // Relación con la tabla "servicios"
    },

    fecha: {
      type: DataTypes.DATEONLY, // Solo la fecha (formato YYYY-MM-DD)
      allowNull: false,
    },

    horaInicio: {
      type: DataTypes.TIME, // Hora exacta de inicio de la cita (HH:mm:ss)
      allowNull: false,
    },

    estado: {
      type: DataTypes.ENUM("agendada", "confirmada", "completada", "cancelada"),
      defaultValue: "agendada", // Valor por defecto al crear una nueva cita
    },

  },
  {
    sequelize, // Conexión a la base de datos
    modelName: "Cita", // Nombre del modelo
    tableName: "citas", // Nombre de la tabla en la BD
    timestamps: true, // Sequelize generará automáticamente "createdAt" y "updatedAt"
  }
);

// Definición de relaciones entre modelos opcional

export default Cita;
