import { DataTypes, Model } from "sequelize"; // Importamos los tipos de datos y la clase Model desde Sequelize
import sequelize from "./db.js"; // Importamos la configuración de la base de datos

// Definimos la clase Usuario que hereda de Model
class Usuario extends Model {}

// Inicializamos el modelo Usuario con sus campos y configuración
Usuario.init(
  {
    // Definimos los atributos del modelo Usuario

    id: {
      type: DataTypes.INTEGER,        // Tipo entero
      autoIncrement: true,            // Se incrementa automáticamente
      primaryKey: true,               // Es la clave primaria
    },
    nombre: {
      type: DataTypes.STRING,         // Tipo cadena
      allowNull: false,               // No puede ser nulo
    },
    apellido: {
      type: DataTypes.STRING,         // Tipo cadena
      allowNull: false,               // No puede ser nulo
    },
    email: {
      type: DataTypes.STRING,         // Tipo cadena
      allowNull: false,               // No puede ser nulo
      unique: true,                   // Debe ser único en la tabla
      validate: { isEmail: true },    // Validación: debe tener formato de correo
    },
    password: {
      type: DataTypes.STRING,         // Tipo cadena
      allowNull: false,               // No puede ser nulo
    },
    rol: {
      type: DataTypes.ENUM("admin", "odontologo", "paciente"), // Solo acepta uno de estos valores
      defaultValue: "paciente",       // Valor por defecto
    },
    foto_perfil: {
      type: DataTypes.STRING,         // Ruta o URL de la foto (cadena)
    },
    activo: {
      type: DataTypes.BOOLEAN,        // Valor booleano
      defaultValue: true,             // Por defecto el usuario está activo
    },
  },
  {
    // Segundo objeto: configuración del modelo

    sequelize,                        // Instancia de conexión a la base de datos
    modelName: "Usuario",             // Nombre del modelo (interno en Sequelize)
    tableName: "usuarios",           // Nombre de la tabla en la base de datos
    timestamps: true,                // Agrega automáticamente createdAt y updatedAt
  }
);

// Exportamos el modelo para usarlo en otras partes del proyecto
export default Usuario;
