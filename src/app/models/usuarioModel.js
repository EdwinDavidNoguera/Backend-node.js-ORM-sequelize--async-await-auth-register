// Importamos las herramientas necesarias de Sequelize
import { DataTypes, Model } from "sequelize";

// Importamos la conexión a la base de datos
import sequelize from "./db.js";

/**
 * Modelo Usuario
 *
 * Este modelo representa la tabla `usuario` en la base de datos.
 * Su responsabilidad es manejar:
 * - autenticación
 * - recuperación de contraseña
 * - roles
 * - estado del usuario
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
     * Se almacena encriptada mediante bcrypt.
     */
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    /**
     * Token temporal utilizado para recuperar la contraseña.
     *
     * Cuando el usuario solicita recuperar su contraseña,
     * se genera un token aleatorio y se almacena aquí.
     */
    reset_password_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    /**
     * Fecha y hora en la que deja de ser válido
     * el token de recuperación.
     */
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    /**
     * Rol del usuario dentro del sistema
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
     */
    avatar: {
      type: DataTypes.STRING(255),
      defaultValue: "default-avatar.png",
    },
  },
  {
    sequelize,
    modelName: "Usuario",
    tableName: "usuario",
    timestamps: false,
  }
);

// Exportamos el modelo
export default Usuario;