// Importamos Sequelize
import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo Paciente
 * Representa la tabla `paciente` en la base de datos.
 * Contiene la información personal del paciente.
 * Puede estar o no asociado a un usuario (id_usuario opcional).
 */
class Paciente extends Model {}

Paciente.init(
  {
    
    // ID del paciente (clave primaria)
     
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    
     // Nombre del paciente
    
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre es obligatorio" },
      },
    },

    
    // Apellido del paciente
    
    apellido: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El apellido es obligatorio" },
      },
    },

    
    // Cédula (puede ser nula)
    
    cedula: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    
     // Número de celular
     
    celular: { // Se mantiene como string para preservar ceros iniciales y solo numeros
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El celular es obligatorio" },
        is: {
          args: /^\d{10}$/, // Solo dígitos, exactamente 10 caracteres
          msg: "El celular debe tener exactamente 10 dígitos"
        },
      },
    },

    
     // Género del paciente
     
    genero: {
      type: DataTypes.ENUM("MASCULINO", "FEMENINO", "OTRO"),
      allowNull: false,
    },

   
     // Fecha de nacimiento (opcional)
     
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    
     //Dirección del paciente (opcional)
     
    direccion: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    /**
     * Relación con usuario (opcional)
     * Puede ser null si el paciente no tiene cuenta
     */
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    /**
     * Email del paciente
     * (puede ser diferente al del usuario)
     */
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: { msg: "Debe ser un email válido" },
      },
    },
  },
  {
    sequelize,
    modelName: "Paciente", // Nombre del modelo en Sequelize
    tableName: "paciente",

    
    // La tabla NO tiene createdAt ni updatedAt
     
    timestamps: false,
  }
);

export default Paciente;