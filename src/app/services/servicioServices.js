import Servicio from "../models/servicioModel.js";
import AppError from "../utils/errors/appError.js";

class ServicioService {

  /**
   * =============================
   * VALIDACIONES PRIVADAS
   * =============================
   */

  static validarCamposObligatorios(nombre, costo, duracion_minutos) {

    if (!nombre || nombre.trim() === "") {
      throw new AppError(
        "El nombre del servicio es obligatorio",
        400
      );
    }

    if (costo === undefined || costo === null) {
      throw new AppError(
        "El costo es obligatorio",
        400
      );
    }

    if (
      duracion_minutos === undefined ||
      duracion_minutos === null
    ) {
      throw new AppError(
        "La duración es obligatoria",
        400
      );
    }
  }

  static validarValoresNumericos(costo, duracion_minutos) {

    const costoNumero = Number(costo);
    const duracionNumero = Number(duracion_minutos);

    if (
      Number.isNaN(costoNumero) ||
      costoNumero < 0
    ) {
      throw new AppError(
        "El costo debe ser un número positivo",
        400
      );
    }

    if (
      Number.isNaN(duracionNumero) ||
      duracionNumero <= 0
    ) {
      throw new AppError(
        "La duración debe ser mayor a 0 minutos",
        400
      );
    }
  }

  static async validarNombreDuplicado(nombre, id = null) {

    const servicioExistente = await Servicio.findOne({
      where: {
        nombre: nombre.trim()
      }
    });

    if (!servicioExistente) return;

    // Si estoy editando y el registro encontrado
    // es el mismo, no lanzar error
    if (
      id &&
      Number(servicioExistente.id) === Number(id)
    ) {
      return;
    }

    throw new AppError(
      `Ya existe un servicio llamado: ${nombre}`,
      409
    );
  }

  /**
   * =============================
   * CREAR SERVICIO
   * =============================
   */

  static async crear(datos) {

    const {
      nombre,
      costo,
      duracion_minutos,
      descripcion,
      img
    } = datos;

    // Validaciones
    this.validarCamposObligatorios(
      nombre,
      costo,
      duracion_minutos
    );

    this.validarValoresNumericos(
      costo,
      duracion_minutos
    );

    await this.validarNombreDuplicado(nombre);

    // Crear servicio
    return await Servicio.create({

      nombre: nombre.trim(),

      costo: Number(costo),

      duracion_minutos: Number(duracion_minutos),

      descripcion: descripcion || null,

      activo: true,

      ...(img && { img })
    });
  }

  /**
   * =============================
   * OBTENER TODOS
   * =============================
   */

  static async obtenerTodos() {

    return await Servicio.findAll({
      where: {
        activo: true
      }
    });
  }

  /**
   * =============================
   * OBTENER POR ID
   * =============================
   */

  static async obtenerPorId(id) {

    const servicio = await Servicio.findByPk(id);

    if (!servicio) {
      throw new AppError(
        "Servicio no encontrado",
        404
      );
    }

    return servicio;
  }

  /**
   * =============================
   * ACTUALIZAR SERVICIO
   * =============================
   */

  static async actualizar(id, datos) {

    const servicio = await this.obtenerPorId(id);

    const {
      nombre,
      costo,
      duracion_minutos,
      descripcion,
      img,
      activo
    } = datos;

    // Validar duplicados
    if (nombre) {
      await this.validarNombreDuplicado(nombre, id);
    }

    // Validaciones numéricas
    if (
      costo !== undefined ||
      duracion_minutos !== undefined
    ) {
      this.validarValoresNumericos(
        costo !== undefined
          ? costo
          : servicio.costo,

        duracion_minutos !== undefined
          ? duracion_minutos
          : servicio.duracion_minutos
      );
    }

    // Actualizar
    return await servicio.update({

      nombre:
        nombre !== undefined
          ? nombre.trim()
          : servicio.nombre,

      costo:
        costo !== undefined
          ? Number(costo)
          : servicio.costo,

      duracion_minutos:
        duracion_minutos !== undefined
          ? Number(duracion_minutos)
          : servicio.duracion_minutos,

      descripcion:
        descripcion !== undefined
          ? descripcion
          : servicio.descripcion,

      img:
        img !== undefined
          ? img
          : servicio.img,

      activo:
        activo !== undefined
          ? activo
          : servicio.activo
    });
  }

  /**
   * =============================
   * ELIMINACIÓN LÓGICA
   * =============================
   */

  static async eliminar(id) {

    const servicio = await this.obtenerPorId(id);

    await servicio.update({
      activo: false
    });

    return true;
  }
}

export default ServicioService;