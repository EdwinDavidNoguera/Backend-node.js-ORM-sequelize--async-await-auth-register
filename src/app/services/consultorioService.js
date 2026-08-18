// src/app/services/consultorioService.js
import { Consultorio } from "../models/indexModel.js";
import AppError from "../utils/errors/appError.js";

class ConsultorioService {
  
  // Crear consultorio
  static async crearConsultorio(datos) {
    // Validar si el nombre ya existe (tiene restricción UNIQUE en la BD)
    const existeConsultorio = await Consultorio.findOne({ where: { nombre: datos.nombre } });
    if (existeConsultorio) {
      throw new AppError("Ya existe un consultorio registrado con este nombre", 400);
    }
    
    return await Consultorio.create(datos);
  }

  // Obtener todos los consultorios
  static async obtenerConsultorios(soloActivos = true) {
    const whereClause = soloActivos ? { activo: 1 } : {};
    return await Consultorio.findAll({ where: whereClause });
  }

  // Obtener consultorio por ID
  static async obtenerConsultorioPorId(id) {
    const consultorio = await Consultorio.findByPk(id);
    if (!consultorio) {
      throw new AppError("El consultorio solicitado no fue encontrado", 404);
    }
    return consultorio;
  }

  // Actualizar consultorio
  static async actualizarConsultorio(id, datos) {
    const consultorio = await this.obtenerConsultorioPorId(id);

    // Si están actualizando el nombre, verificar que no choque con otro existente
    if (datos.nombre && datos.nombre.trim() !== consultorio.nombre) {
      const existeNombre = await Consultorio.findOne({ where: { nombre: datos.nombre.trim() } });
      if (existeNombre) {
        throw new AppError("El nuevo nombre de consultorio ya está en uso", 400);
      }
    }

    return await consultorio.update(datos);
  }

  // Eliminar consultorio
  static async eliminarConsultorio(id) {
    const consultorio = await this.obtenerConsultorioPorId(id);
    
    // Eliminación física
    await consultorio.destroy();
    return true;
  }
}

export default ConsultorioService;