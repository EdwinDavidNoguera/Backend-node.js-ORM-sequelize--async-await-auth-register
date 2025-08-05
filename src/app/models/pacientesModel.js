import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";
import Usuario from "../models/usuariosModel.js";

class Paciente extends Model {}

Paciente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    fecha_nacimiento: { type: DataTypes.DATEONLY },
    celular: { type: DataTypes.STRING },
    genero: {
      type: DataTypes.ENUM("masculino", "femenino", "otro"),
    },
    
  },
  {
    sequelize,
    modelName: "Paciente",
    tableName: "pacientes",
    timestamps: true,
  }
);

// Relación uno a uno con Usuario
Usuario.hasOne(Paciente, { foreignKey: "id", as: "paciente" });
Paciente.belongsTo(Usuario, { foreignKey: "id", as: "usuario" });

export default Paciente;
