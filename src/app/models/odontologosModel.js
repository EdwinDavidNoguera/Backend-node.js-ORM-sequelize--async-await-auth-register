import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";
import Usuario from "../models/usuariosModel.js";

class Odontologo extends Model {}

Odontologo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    especialidad: { type: DataTypes.STRING, allowNull: false },
    numero_licencia: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    descripcion: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: "Odontologo",
    tableName: "odontologos",
    timestamps: true,
  }
);

// Relación uno a uno con Usuario
Usuario.hasOne(Odontologo, { foreignKey: "id", as: "odontologo" });
Odontologo.belongsTo(Usuario, { foreignKey: "id", as: "usuario" });

export default Odontologo;
