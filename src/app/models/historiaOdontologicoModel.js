import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo HistoriaOdontologica
 * Representa la tabla `historia_odontologica` en la base de datos.
 * Registra el detalle clínico de cada cita atendida.
 *
 * Relaciones: definidas en indexModel.js
 * - belongsTo Cita (FK: id_cita)
 */
class HistoriaOdontologica extends Model {}

HistoriaOdontologica.init(
  {
    /**
     * ID del registro (clave primaria)
     */
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /**
     * FK hacia la tabla `cita`
     * Cada registro de historia pertenece a una cita específica
     */
    id_cita: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    /**
     * Motivo por el que el paciente asistió a la cita (opcional)
     */
    motivo_consulta: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    /**
     * Diagnóstico emitido por el odontólogo
     */
    diagnostico: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El diagnóstico es obligatorio" },
      },
    },

    /**
     * Descripción del tratamiento realizado durante la cita
     */
    tratamiento_realizado: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "El tratamiento realizado es obligatorio" },
      },
    },

    /**
     * Medicamentos recetados al paciente (opcional)
     */
    medicamentos_recetados: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    /**
     * Observaciones adicionales del odontólogo (opcional)
     */
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "HistoriaOdontologica",
    tableName: "historia_odontologica",

    /**
     * La tabla tiene createdAt y updatedAt
     */
    timestamps: false,
    createdAt: "fecha_registro",
    updatedAt: false // No se actualiza el registro después de creado
  }
);

export default HistoriaOdontologica;