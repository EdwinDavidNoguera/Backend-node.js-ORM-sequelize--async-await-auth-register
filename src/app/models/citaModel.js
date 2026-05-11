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
     * Formato: HH:mm:ss
     */
    hora: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        isTime: { msg: "La hora debe tener el formato HH:mm:ss" },
      },
    },

    /**
     * hora fin de la cita, necesaria para validar solapamientos de citas
     * Formato: HH:mm:ss
     */
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        isTime: { msg: "La hora de finalización debe tener el formato HH:mm:ss" },
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

    /**
     * La tabla tiene timestamps
     */
    timestamps: true,
  }
);

export default Cita;