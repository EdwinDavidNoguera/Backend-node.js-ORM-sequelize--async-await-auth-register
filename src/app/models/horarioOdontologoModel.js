import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";
import Odontologo from "./odontologosModel.js";

// Definición del modelo HorarioOdontologo
class HorarioOdontologo extends Model {
  // Método de instancia: verificar si un horario está activo
  estaDisponible() {
    return this.disponible === true;
  }

  // Método estático: buscar horarios por día
  static async buscarPorDia(dia) {
    return await this.findAll({ where: { dia_semana: dia } });
  }
}

// Inicialización del modelo
HorarioOdontologo.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },

    odontologoId: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: Odontologo,
        key: "id",
      },

    },

    dia_semana: { 
      type: DataTypes.ENUM(
        "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
      ), 
      allowNull: false 
    },

    hora_inicio: { 
      type: DataTypes.TIME, 
      allowNull: false 
    },

    hora_fin: { 
      type: DataTypes.TIME, 
      allowNull: false 
    },

    disponible: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    }
  },
  {
    sequelize,                 // conexión a la BD
    modelName: "HorarioOdontologo", 
    tableName: "horarios_odontologos",
    timestamps: true           // incluye createdAt y updatedAt
  }
);

export default HorarioOdontologo;
