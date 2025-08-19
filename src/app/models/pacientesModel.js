import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";
import Usuario from "../models/usuariosModel.js";

// Definimos la clase Paciente como un modelo de Sequelize
class Paciente extends Model {}

// Inicializamos el modelo Paciente con sus campos
Paciente.init(
  {
    // Usamos el mismo ID del modelo Usuario como clave primaria
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: Usuario, // Referencia al modelo Usuario
        key: "id",       // Llave foránea
      },
    },
    // Campo para almacenar la fecha de nacimiento del paciente
    fecha_nacimiento: { type: DataTypes.DATEONLY },

    // Campo para almacenar el número de celular
    celular: { type: DataTypes.STRING },

    // Campo para el género con un conjunto definido de valores permitidos
    genero: {
      type: DataTypes.ENUM("masculino", "femenino", "otro"),
    },
  },
  {
    sequelize,             // Instancia de conexión con la base de datos
    modelName: "Paciente", // Nombre interno del modelo
    tableName: "pacientes",// Nombre de la tabla en la base de datos
    timestamps: true,      // Agrega campos createdAt y updatedAt automáticamente
  }
);


// Exportamos el modelo para usarlo en otras partes del proyecto
export default Paciente;
