// Importamos las herramientas necesarias de Sequelize
import { DataTypes, Model } from "sequelize";

// Importamos la conexión a la base de datos
import sequelize from "./db.js";

/**
 * Modelo Usuario
 * 
 * Este modelo representa la tabla `usuario` en la base de datos.
 * Su responsabilidad es únicamente manejar autenticación y acceso:
 * - login
 * - roles
 * - estado del usuario
 * 
 */
class Usuario extends Model {}

// Inicializamos el modelo con sus atributos y configuración
Usuario.init(
  {
    /**
     * ID del usuario (clave primaria)
     * Se incrementa automáticamente
     */
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /**
     * Email del usuario
     * - Obligatorio
     * - Debe ser único
     * - Validado como correo electrónico
     */
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Debe ser un email válido" },
        notEmpty: { msg: "El email es obligatorio" },
      },
    },

    /**
     * Contraseña del usuario
     * Debe almacenarse encriptada (bcrypt en el service)
     */
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    /**
     * Rol del usuario dentro del sistema
     * Solo puede ser uno de los definidos en la BD
     */
    rol: {
      type: DataTypes.ENUM("ADMIN", "PACIENTE", "ODONTOLOGO"),
      allowNull: false,
    },

    /**
     * Estado del usuario
     * - true → activo
     * - false → deshabilitado
     */
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    /**
     * Avatar del usuario
     * - Puede ser una URL o nombre de archivo
     * - Tiene un valor por defecto definido en la BD
     */
    avatar: {
      type: DataTypes.STRING(255),
      defaultValue: "default-avatar.png",
    },
  },
  {
    /**
     * Configuración del modelo
     */

    sequelize,                  // Conexión a la base de datos
    modelName: "Usuario",       // Nombre interno del modelo
    tableName: "usuario",       // Nombre real de la tabla en la BD

    
    timestamps: false,
  }
);

// Exportamos el modelo para usarlo en otras capas (services, controllers, etc.)
export default Usuario;