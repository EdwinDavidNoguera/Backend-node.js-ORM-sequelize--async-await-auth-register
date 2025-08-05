import { DataTypes, Model } from "sequelize";
import sequelize from "./db.js"; // Importamos la configuración de la base de datos por que es nombrada

class Usuario extends Model {}

Usuario.init( // con esta función inicializamos el modelo Usuario y no es necesario inicializarlo en index.js
  {//recibe dos objetos, el primero es un objeto con los atributos del modelo y el segundo es un objeto de configuración
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    apellido: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false, //no puede ser nulo
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    rol: {
      type: DataTypes.ENUM("admin", "odontologo", "paciente"),
      defaultValue: "paciente",
    },
    foto_perfil: { type: DataTypes.STRING },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Usuario",
    tableName: "usuarios",
    timestamps: true,
  }
);

export default Usuario;
