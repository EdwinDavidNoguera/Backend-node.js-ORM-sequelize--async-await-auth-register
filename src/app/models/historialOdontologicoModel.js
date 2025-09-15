import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";
//✅✅✅✅✅✅✅✅

/**
 * Modelo que representa el historial clínico de un paciente en la base de datos.
 * Cada historial corresponde a una consulta o conjunto de consultas realizadas
 * a lo largo del tiempo para un paciente específico.
 */
class HistorialOdontologico extends Model {
  // Método de instancia: ver si el historial tiene diagnóstico registrado
  tieneDiagnostico() {
    return this.diagnosticoGeneral && this.diagnosticoGeneral.trim() !== "";
  }

  // Método estático: buscar historiales por paciente
  static async buscarPorPaciente(pacienteId) {
    return await this.findAll({ where: { pacienteId } });
  }
}

// Inicialización del modelo sin relaciones
HistorialOdontologico.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },

    pacienteId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },

    diagnosticoGeneral: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },

    observaciones: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },

    antecedentesMedicos: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
  },
  {
    sequelize, 
    modelName: "HistorialOdontologico",
    tableName: "historiales",
    timestamps: true
  }
);

export default HistorialOdontologico;
