import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo que representa una consulta odontológica, la cual se desprende de una cita previa.
 * es decir, cada consulta está vinculada a una cita específica (relación 1:1).
 * Incluye detalles como motivo, diagnóstico y observaciones.
 * Permite registrar y gestionar la información relevante de cada consulta realizada.
 */

class Consulta extends Model {

  
  // Método estático: buscar consultas por paciente (a través de la cita)
  static async buscarPorPaciente(pacienteId) {
    return await this.findAll({
      include: {
        association: "cita",
        where: { pacienteId }
      }
    });
  }
}

Consulta.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    citaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true, // Relación 1:1 con Cita, aqui hay una columna unica
    },

     historialId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    motivoConsulta: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    diagnostico: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    sequelize,
    modelName: "Consulta",
    tableName: "consultas",
    timestamps: true,
  }
);

export default Consulta;
