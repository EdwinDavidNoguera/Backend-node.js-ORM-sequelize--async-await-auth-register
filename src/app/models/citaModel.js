// Importamos Sequelize
import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo Cita
 * Representa la tabla `cita` en la base de datos.
 * Gestiona las citas odontológicas del sistema.
 */
class Cita extends Model {}

Cita.init(
  {
    /**
     * ID de la cita (clave primaria)
     */
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /**
     * Relación con paciente (opcional)
     */
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    /**
     * Relación con odontólogo (opcional)
     */
    id_odontologo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    /**
     * Relación con servicio (opcional)
     */
    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    /**
     * Relación con consultorio (opcional)
     */
    id_consultorio: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    /**
     * Fecha de la cita
     * Formato: YYYY-MM-DD
     */
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: "La fecha debe tener el formato YYYY-MM-DD" },
      },
    },

    /**
     * Hora de la cita
     * Acepta formatos: "09:00" o "09:00:00"
     */
    hora: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        is: {
          args: [/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/],
          msg: "La hora debe tener un formato válido (HH:mm o HH:mm:ss)",
        },
      },
    },

    /**
     * Hora fin de la cita, necesaria para validar solapamientos
     * Acepta formatos: "09:45" o "09:45:00"
     */
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        is: {
          args: [/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/],
          msg: "La hora de finalización debe tener un formato válido (HH:mm o HH:mm:ss)",
        },
      },
    },

    /**
     * Estado de la cita
     */
    estado: {
      type: DataTypes.ENUM("PROGRAMADA", "CANCELADA", "ATENDIDA"),
      allowNull: false,
      defaultValue: "PROGRAMADA",
    },
  },
  {
    sequelize,
    modelName: "Cita",
    tableName: "cita",
    timestamps: false,
  }
);

export default Cita;