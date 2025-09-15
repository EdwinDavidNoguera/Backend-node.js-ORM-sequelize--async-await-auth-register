import { DataTypes, Model } from "sequelize"; // Importación de tipos de datos y clase base Model
import sequelize from "./db.js"; // Importación de la instancia de conexión a la base de datos
import Usuario from "../models/usuariosModel.js"; // Importación del modelo Usuario, necesario para establecer relaciones
import Consultorio from "./consultorioOdontologicoModel.js"; // Importación del modelo Consultorio, necesario para establecer relaciones

// Definición del modelo Odontologo como clase que extiende de Model
class Odontologo extends Model {}

Odontologo.init(
  {
    // ID del odontólogo, que también es clave foránea referenciando a un usuario
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Usuario, // Se referencia al modelo Usuario
        key: "id", // Se usa el campo "id" del modelo Usuario como referencia
      },
    },

    consultorioId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // Campo para la especialidad del odontólogo (obligatorio)
    especialidad: { type: DataTypes.STRING, allowNull: false },

    // Campo para el número de licencia (único y obligatorio)
    numero_licencia: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    // Campo opcional para una descripción del odontólogo
    descripcion: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize, // Conexión a la base de datos
    modelName: "Odontologo", // Nombre del modelo dentro de Sequelize
    tableName: "odontologos", // Nombre de la tabla en la base de datos
    timestamps: true, // Habilita automáticamente los campos createdAt y updatedAt se pueden usar para rastrear la creación y actualización de registros
  }
);


export default Odontologo; // Exportación del modelo para uso en otras partes de la aplicación
