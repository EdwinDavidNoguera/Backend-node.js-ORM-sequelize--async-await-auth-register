import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo PerfilOdontologo
 * Representa la tabla `perfil_odontologo` en la base de datos.
 * Contiene información profesional y de perfil del odontólogo.
 * 
 * Relaciones: definidas en indexModel.js
 * - belongsTo Odontologo (FK: id_odontologo)
 */
class PerfilOdontologo extends Model {}

PerfilOdontologo.init(
  {
    /**
     * ID del perfil (clave primaria)
     */
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /**
     * FK hacia la tabla `odontologo`
     */
    id_odontologo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    /**
     * Imagen de perfil del odontólogo
     * Si no se proporciona, usa la imagen por defecto
     */
    img: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "perfil-default.png",
    },

    /**
     * Título profesional del odontólogo (ej: "Odontólogo General")
     */
    titulo_profesional: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El título profesional es obligatorio" },
      },
    },

    /**
     * Universidad donde se graduó (opcional)
     */
    universidad: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    /**
     * Especialidad del odontólogo (opcional, ej: "Ortodoncia")
     */
    especialidad: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    /**
     * Fecha en que el odontólogo comenzó a ejercer (opcional)
     */
    fecha_inicio_ejercicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    /**
     * Indica si el odontólogo está activo en el sistema
     * 1 = activo, 0 = inactivo
     */
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: "PerfilOdontologo",
    tableName: "perfil_odontologo",

    
    timestamps: false,
  }
);

export default PerfilOdontologo;