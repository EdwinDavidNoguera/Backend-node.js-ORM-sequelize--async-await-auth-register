// Importamos Sequelize
import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo Odontologo
 * Representa la tabla `odontologo` en la base de datos.
 * Contiene la información personal y profesional básica del odontólogo.
 * Siempre está asociado a un usuario (id_usuario obligatorio)
 */
class Odontologo extends Model {}

Odontologo.init(
  {
    /**
     * ID del odontólogo (clave primaria)
     */
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /**
     * Relación obligatoria con usuario
     */
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    /**
     * Nombre del odontólogo
     */
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre es obligatorio" },
      },
    },

    /**
     * Apellido del odontólogo
     */
    apellido: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El apellido es obligatorio" },
      },
    },

    /**
     * Cédula del odontólogo
     */
    cedula: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    /**
     * Celular del odontólogo
     */
    celular: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    /**
     * Número de licencia profesional
     */
    numero_licencia: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Odontologo",
    tableName: "odontologo",

    /**
     * La tabla NO tiene timestamps
     */
    timestamps: false,
  }
);

export default Odontologo;