import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo HorarioOdontologo
 * Representa los horarios de disponibilidad de cada odontólogo durante la semana.
 * Tabla correspondiente en BD: `horario_odontologo`
 */
class HorarioOdontologo extends Model {}

HorarioOdontologo.init(
  {
    // Clave primaria autoincremental
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // FK hacia la tabla `odontologos` — un horario pertenece a un odontólogo
    id_odontologo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Día de la semana usando ENUM igual al definido en SQL (valores en mayúsculas)
    dia_semana: {
      type: DataTypes.ENUM("LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"),
      allowNull: false,
    },

    // Hora de inicio del turno (formato HH:MM:SS)
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    // Hora de finalización del turno (formato HH:MM:SS)
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize,                        // Instancia de conexión a la BD
    modelName: "HorarioOdontologo",   // Nombre interno del modelo en Sequelize
    tableName: "horario_odontologo",  // Nombre exacto de la tabla en la BD
    timestamps: false,                // La tabla SQL no tiene createdAt ni updatedAt
  }, 
);

export default HorarioOdontologo;