import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

class Consultorio extends Model {
  // Método de instancia: devuelve dirección completa
  direccionCompleta() {
    return `${this.nombre} - ${this.direccion}`;
  }

  // Método estático: buscar consultorios por dirección
  static async buscarPorDireccion(direccion) {
    return await this.findAll({ where: { direccion } });
  }
}

Consultorio.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },

    nombre: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },

    direccion: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },

    numero: { 
      type: DataTypes.STRING, 
      allowNull: false 
    }
  },
  {
    sequelize,
    modelName: "Consultorio",
    tableName: "consultorios",
    timestamps: true // añade createdAt y updatedAt
  }
);

export default Consultorio;
