import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

class OdontologoServicio extends Model {}

OdontologoServicio.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_odontologo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "OdontologoServicio",
    tableName: "odontologo_servicio",
    timestamps: false,
  }
);

export default OdontologoServicio;