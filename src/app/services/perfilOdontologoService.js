// src/app/services/perfilOdontologoService.js
import { PerfilOdontologo, Odontologo } from "../models/indexModel.js";
import AppError from "../utils/errors/appError.js";

class PerfilOdontologoService {
  
  static async crearPerfil(datos) {
    const { id_odontologo } = datos;

    // 1. Verificar que el odontólogo exista
    const odontologo = await Odontologo.findByPk(id_odontologo);
    if (!odontologo) {
      throw new AppError("El odontólogo especificado no existe en el sistema", 404);
    }

    // 2. Verificar que no tenga un perfil creado previamente (relación 1 a 1)
    const perfilExistente = await PerfilOdontologo.findOne({ where: { id_odontologo } });
    if (perfilExistente) {
      throw new AppError("Este odontólogo ya cuenta con un perfil registrado", 400);
    }

    return await PerfilOdontologo.create(datos);
  }

  static async obtenerPerfilPorOdontologo(id_odontologo) {
    const perfil = await PerfilOdontologo.findOne({ where: { id_odontologo } });
    if (!perfil) {
      throw new AppError("No se encontró el perfil profesional para este odontólogo", 404);
    }
    return perfil;
  }

  static async actualizarPerfil(id, datos) {
    const perfil = await PerfilOdontologo.findByPk(id);
    if (!perfil) {
      throw new AppError("El perfil que intentas actualizar no existe", 404);
    }

    return await perfil.update(datos);
  }

  static async eliminarPerfil(id) {
    const perfil = await PerfilOdontologo.findByPk(id);
    if (!perfil) {
      throw new AppError("El perfil solicitado no fue encontrado", 404);
    }

    await perfil.destroy();
    return true;
  }
}

export default PerfilOdontologoService;