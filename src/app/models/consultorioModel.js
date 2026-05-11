import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo Consultorio
 * Representa la tabla `consultorio` en la base de datos.
 * Contiene la información de los consultorios odontológicos.
 *
 * Relaciones: definidas en indexModel.js
 * - hasMany Odontologo (FK: id_consultorio)
 */
class Consultorio extends Model {}

Consultorio.init(
  {
    /**
     * ID del consultorio (clave primaria)
     */
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /**
     * Nombre del consultorio (ej: "Consultorio Norte")
     */
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre del consultorio es obligatorio" },
      },
    },

    /**
     * Dirección física del consultorio
     */
    direccion: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: "La dirección es obligatoria" },
      },
    },

    /**
     * Ciudad donde está ubicado el consultorio
     */
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "La ciudad es obligatoria" },
      },
    },

    /**
     * Indica si el consultorio está activo y operativo
     */
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Consultorio",
    tableName: "consultorio",

    /**
     * La tabla NO tiene createdAt ni updatedAt
     */
    timestamps: false,
  }
);

export default Consultorio;