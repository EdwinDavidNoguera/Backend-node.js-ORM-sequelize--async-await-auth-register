// src/app/models/serviciosModel.js
import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo Servicio
 * Representa los servicios odontológicos ofrecidos (ej. consulta, limpieza, ortodoncia).
 * Cada servicio incluye nombre, descripción, precio y opcionalmente una imagen.
 */
class Servicio extends Model {}

// Definición de atributos y configuración del modelo
Servicio.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true, // Se incrementa automáticamente en cada nuevo registro
      primaryKey: true,    // Llave primaria de la tabla
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: false,    // No puede estar vacío, todo servicio debe tener un nombre
    },

    descripcion: {
      type: DataTypes.TEXT, 
      allowNull: true,     // Puede ser opcional (ej: "Limpieza dental profunda en 1 hora")
    },

    precio: {
      type: DataTypes.DECIMAL(10, 2), // Hasta 10 dígitos, 2 decimales (ej: 150000.00)
      allowNull: false,               // Todo servicio debe tener un precio definido
    },

    img: {
      type: DataTypes.STRING, // Se puede guardar una URL o path de imagen
      allowNull: true,        // No es obligatorio (ej: algunos servicios no requieren imagen)
    },
  },
  {
    sequelize,              // Conexión activa a la base de datos
    modelName: "Servicio",  // Nombre lógico del modelo dentro de Sequelize
    tableName: "servicios", // Nombre real de la tabla en la base de datos
    timestamps: true,       // Crea automáticamente columnas createdAt y updatedAt
  }
);

export default Servicio; // Exportamos el modelo para poder usarlo en controladores y servicios
