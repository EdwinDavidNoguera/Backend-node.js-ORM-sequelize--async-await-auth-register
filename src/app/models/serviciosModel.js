import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo Servicio
 * Representa la tabla `servicio` en la base de datos.
 * Contiene los servicios odontológicos ofrecidos por la clínica.
 *
 * Relaciones: definidas en indexModel.js
 * - hasMany Cita (FK: id_servicio)
 */
class Servicio extends Model {}

Servicio.init(
  {
    /**
     * ID del servicio (clave primaria)
     */
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /**
     * Nombre del servicio (ej: "Limpieza dental", "Ortodoncia")
     */
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre del servicio es obligatorio" },
      },
    },

    /**
     * Imagen representativa del servicio
     * Si no se proporciona, usa la imagen por defecto
     */
    img: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "servicio-default.png",
    },

    /**
     * Descripción detallada del servicio (opcional)
     */
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    /**
     * Duración del servicio en minutos
     * Necesario para calcular disponibilidad en la agenda
     */
    duracion_minutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: { args: [1], msg: "La duración debe ser mayor a 0 minutos" },
      },
    },

    /**
     * Costo del servicio
     * Formato decimal (ej: 150000.00)
     */
    costo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [0], msg: "El costo no puede ser negativo" },
      },
    },

    /**
     * Indica si el servicio está activo y disponible para agendar
     */
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Servicio",
    tableName: "servicio",

    
    timestamps: false,
  }
);

export default Servicio;