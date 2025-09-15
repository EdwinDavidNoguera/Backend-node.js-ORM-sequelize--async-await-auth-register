// Importa dependencias de Sequelize
import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";


//✅✅✅✅✅✅✅✅


/**
 * Modelo para gestionar los tratamientos odontológicos.
 * Un tratamiento está asociado a un historial clínico, a un odontólogo y opcionalmente a una cita.
 * Incluye detalles como fechas, tipo, estado, costo y notas.
 */

class Tratamiento extends Model {
  // Método: verificar si está finalizado, se aplica solo sobre instancias 
  esFinalizado() {
    return this.estado === "finalizado";
  }

  // Método: calcular duración en días (si tiene fecha de fin)
  calcularDuracion() {
    if (this.fecha_fin && this.fecha_inicio) {
      const diffMs = new Date(this.fecha_fin) - new Date(this.fecha_inicio);
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // días
    }
    return null;
  }

  // Método: formato de costo
  costoFormateado() {
    return this.costo ? `$${parseFloat(this.costo).toFixed(2)}` : "Sin definir";
  }
}

Tratamiento.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },

    // FK: consulta odontológica
    consultaId: { 
      type: DataTypes.INTEGER, 
      allowNull: false
    },

    // FK: odontólogo responsable
    odontologoId: { 
      type: DataTypes.INTEGER, 
      allowNull: false
    },

    historialId: { 
      type: DataTypes.INTEGER, 
      allowNull: false
    },

    // Tipo de tratamiento (ej: Ortodoncia, Limpieza, etc.)
    tipo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true }
    },

    // Descripción detallada
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Estado del tratamiento
    estado: { 
      type: DataTypes.ENUM("pendiente", "en_proceso", "finalizado", "cancelado"), 
      defaultValue: "pendiente" 
    },

    // Fechas de inicio y fin
    fecha_inicio: { 
      type: DataTypes.DATE, 
      allowNull: false,
      validate: { isDate: true }
    },
    fecha_fin: { 
      type: DataTypes.DATE, 
      allowNull: true,
      validate: { isDate: true }
    },

    // Costo del tratamiento
    costo: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: true,
      validate: { min: 0 }
    },

  },
  {
    sequelize,
    modelName: "Tratamiento",
    tableName: "tratamientos",
    timestamps: true
  }
);

export default Tratamiento;
