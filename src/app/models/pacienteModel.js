import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js";

/**
 * Modelo Paciente.
 *
 * Representa la información personal de un paciente.
 *
 * Un paciente puede existir sin tener una cuenta de usuario.
 */
class Paciente extends Model {}

Paciente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre es obligatorio",
        },
      },
    },

    apellido: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El apellido es obligatorio",
        },
      },
    },

    cedula: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    celular: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El celular es obligatorio",
        },
        is: {
          args: /^\d{10}$/,
          msg:
            "El celular debe tener exactamente 10 dígitos",
        },
      },
    },

    genero: {
      type: DataTypes.ENUM(
        "MASCULINO",
        "FEMENINO",
        "OTRO"
      ),
      allowNull: false,
    },

    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    direccion: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    /**
     * Relación opcional con Usuario.
     *
     * NULL = paciente sin cuenta.
     * Valor = paciente asociado a una cuenta.
     */
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Debe ser un email válido",
        },
      },
    },
  },
  {
    sequelize,
    modelName: "Paciente",
    tableName: "paciente",
    timestamps: false,
  }
);

export default Paciente;