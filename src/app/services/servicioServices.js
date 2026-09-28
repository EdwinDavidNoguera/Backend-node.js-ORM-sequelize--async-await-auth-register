import Servicio from "../models/serviciosModel.js";
import Odontologo from "../models/odontologoModel.js";
import OdontologoServicio from "../models/odontologoServicioModel.js";
import sequelize from "../models/db.js";
import AppError from "../utils/errors/appError.js";
import fs from "fs";
import path from "path";

class ServicioService {
  /**
   * Ruta física de la carpeta donde se almacenan las imágenes.
   */
  static rutaUploads = path.resolve("src/app/uploads/servicios");

  /**
   * Nombre de la imagen por defecto.
   */
  static imagenPorDefecto = "servicio-default.png";

  /**
   * Valida que los campos necesarios para un servicio
   * hayan sido proporcionados de forma segura.
   */
  static validarCamposObligatorios(nombre, costo, duracion_minutos) {
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
      throw new AppError("El nombre del servicio es obligatorio y debe ser texto válido", 400);
    }

    if (costo === undefined || costo === null || costo === "") {
      throw new AppError("El costo es obligatorio", 400);
    }

    if (duracion_minutos === undefined || duracion_minutos === null || duracion_minutos === "") {
      throw new AppError("La duración es obligatoria", 400);
    }
  }

  /**
   * Valida que el costo y la duración
   * tengan valores numéricos válidos.
   */
  static validarValoresNumericos(costo, duracion_minutos) {
    const costoNumero = Number(costo);
    const duracionNumero = Number(duracion_minutos);

    if (Number.isNaN(costoNumero) || costoNumero < 0) {
      throw new AppError("El costo debe ser un número positivo", 400);
    }

    if (Number.isNaN(duracionNumero) || duracionNumero <= 0) {
      throw new AppError("La duración debe ser mayor a 0 minutos", 400);
    }
  }

  /**
   * Verifica que no exista otro servicio con el mismo nombre.
   */
  static async validarNombreDuplicado(nombre, id = null) {
    const servicioExistente = await Servicio.findOne({
      where: {
        nombre: nombre.trim()
      }
    });

    if (!servicioExistente) return;

    if (id && Number(servicioExistente.id) === Number(id)) {
      return;
    }

    throw new AppError(`Ya existe un servicio llamado: ${nombre}`, 409);
  }

  /**
   * Comprueba si una imagen existe físicamente.
   * Si no existe, devuelve la imagen por defecto.
   */
  static obtenerImagenValida(img) {
    if (!img) {
      return `/uploads/servicios/${this.imagenPorDefecto}`;
    }

    const nombreArchivo = path.basename(img);

    if (nombreArchivo === this.imagenPorDefecto) {
      return `/uploads/servicios/${this.imagenPorDefecto}`;
    }

    const rutaImagen = path.join(this.rutaUploads, nombreArchivo);

    if (!fs.existsSync(rutaImagen)) {
      console.log(`Imagen no encontrada: ${rutaImagen}`);
      console.log(`Se utilizará la imagen por defecto.`);
      return `/uploads/servicios/${this.imagenPorDefecto}`;
    }

    return `/uploads/servicios/${nombreArchivo}`;
  }

  /**
   * Verifica la imagen de un servicio antes de devolverlo.
   */
  static validarImagenServicio(servicio) {
    if (!servicio) return servicio;

    const imagenValida = this.obtenerImagenValida(servicio.img);

    /*
     * Usamos setDataValue para asegurar que Sequelize registre 
     * el cambio y se envíe correctamente en la respuesta JSON.
     */
    if (typeof servicio.setDataValue === "function") {
      servicio.setDataValue("img", imagenValida);
    } else {
      servicio.img = imagenValida;
    }

    return servicio;
  }

  /**
   * Crea un nuevo servicio odontológico.
   */
  static async crear(datos, archivo) {
    const { nombre, costo, duracion_minutos, descripcion, id_odontologo } = datos;

    this.validarCamposObligatorios(nombre, costo, duracion_minutos);
    this.validarValoresNumericos(costo, duracion_minutos);
    await this.validarNombreDuplicado(nombre);

    let odontologo = null;
    if (id_odontologo !== undefined && id_odontologo !== null && id_odontologo !== "") {
      const idOdontologo = Number(id_odontologo);
      if (!Number.isInteger(idOdontologo) || idOdontologo <= 0) {
        throw new AppError("id_odontologo debe ser un identificador válido", 400);
      }

      odontologo = await Odontologo.findByPk(idOdontologo);
      if (!odontologo) {
        throw new AppError("El odontólogo indicado no existe", 404);
      }
    }

    const servicio = await sequelize.transaction(async transaction => {
      const nuevoServicio = await Servicio.create({
        nombre: nombre.trim(),
        costo: Number(costo),
        duracion_minutos: Number(duracion_minutos),
        descripcion: descripcion || null,
        activo: true,
        ...(archivo && { img: `/uploads/servicios/${archivo.filename}` })
      }, { transaction });

      if (odontologo) {
        await OdontologoServicio.create({
          id_odontologo: odontologo.id,
          id_servicio: nuevoServicio.id
        }, { transaction });
      }

      return nuevoServicio;
    });

    return this.validarImagenServicio(servicio);
  }

  /**
   * Obtiene todos los servicios activos.
   */
  static async obtenerTodosServicios() {
    const servicios = await Servicio.findAll({
      where: { activo: true },
      include: [{
        association: "odontologos",
        model: Odontologo,
        attributes: ["id", "nombre", "apellido", "cedula", "celular", "numero_licencia", "id_usuario"],
        through: { attributes: [] }
      }]
    });

    return servicios.map(servicio => this.validarImagenServicio(servicio));
  }

  /**
   * Obtiene un servicio mediante su identificador.
   */
  static async obtenerPorId(id) {
    const servicio = await Servicio.findByPk(id, {
      include: [{
        association: "odontologos",
        model: Odontologo,
        attributes: ["id", "nombre", "apellido", "cedula", "celular", "numero_licencia", "id_usuario"],
        through: { attributes: [] }
      }]
    });

    if (!servicio) {
      throw new AppError("Servicio no encontrado", 404);
    }

    return this.validarImagenServicio(servicio);
  }

  /**
   * Actualiza un servicio.
   */
  static async actualizar(id, datos, archivo) {
    console.log("========== ACTUALIZAR SERVICIO ==========");
    console.log("ID:", id);
    console.log("Archivo recibido:", archivo);
    const servicio = await Servicio.findByPk(id);

    if (!servicio) {
      throw new AppError("Servicio no encontrado", 404);
    }

    const { nombre, costo, duracion_minutos, descripcion, activo } = datos;

    // Validación segura de string para evitar crasheos con .trim()
    if (nombre !== undefined) {
      if (typeof nombre !== "string" || nombre.trim() === "") {
        throw new AppError("El nombre debe ser un texto válido no vacío", 400);
      }
      await this.validarNombreDuplicado(nombre, id);
    }

    if (costo !== undefined || duracion_minutos !== undefined) {
      this.validarValoresNumericos(
        costo !== undefined && costo !== "" ? costo : servicio.costo,
        duracion_minutos !== undefined && duracion_minutos !== "" ? duracion_minutos : servicio.duracion_minutos
      );
    }

    const imagenAnterior = servicio.img;
    const nuevaImagen = archivo ? `/uploads/servicios/${archivo.filename}` : servicio.img;

    await servicio.update({
      nombre: nombre !== undefined ? nombre.trim() : servicio.nombre,
      costo: costo !== undefined && costo !== "" ? Number(costo) : servicio.costo,
      duracion_minutos: duracion_minutos !== undefined && duracion_minutos !== "" ? Number(duracion_minutos) : servicio.duracion_minutos,
      descripcion: descripcion !== undefined ? descripcion : servicio.descripcion,
      img: nuevaImagen,
      activo: activo !== undefined ? activo : servicio.activo
    });

    if (archivo && imagenAnterior) {
      const nombreImagenAnterior = path.basename(imagenAnterior);
      
      if (nombreImagenAnterior !== this.imagenPorDefecto) {
        const rutaImagenAnterior = path.join(this.rutaUploads, nombreImagenAnterior);
        if (fs.existsSync(rutaImagenAnterior)) {
          fs.unlinkSync(rutaImagenAnterior);
          console.log(`Imagen anterior eliminada: ${rutaImagenAnterior}`);
        }
      }
    }

    return this.validarImagenServicio(servicio);
  }

  /**
   * Elimina completamente un servicio y físicamente su imagen.
   */
  static async eliminar(id) {
    const servicio = await Servicio.findByPk(id);

    if (!servicio) {
      throw new AppError("Servicio no encontrado", 404);
    }

    const imagen = servicio.img;
    await servicio.destroy();

    if (imagen) {
      const nombreImagen = path.basename(imagen);
      
      if (nombreImagen !== this.imagenPorDefecto) {
        const rutaImagen = path.join(this.rutaUploads, nombreImagen);
        if (fs.existsSync(rutaImagen)) {
          fs.unlinkSync(rutaImagen);
          console.log(`Imagen del servicio eliminada: ${rutaImagen}`);
        }
      }
    }

    return servicio;
  }

  /* =========================================================================
   * MÉTODO AÑADIDO: Era requerido por tu Controlador y faltaba en tu código
   * ========================================================================= */
  static async obtenerOdontologosPorServicio(id) {
    const servicio = await Servicio.findByPk(id);
    if (!servicio) throw new AppError("Servicio no encontrado", 404);

    return servicio.getOdontologos({
      attributes: ["id", "nombre", "apellido", "cedula", "celular", "numero_licencia", "id_usuario"],
      joinTableAttributes: []
    });
  }

  /* =========================================================================
   * MÉTODO AÑADIDO: Era requerido por tu Controlador y faltaba en tu código
   * ========================================================================= */
  static async asignarServiciosAOdontologo(id_odontologo, ids_servicios) {
    if (!id_odontologo || !ids_servicios || !Array.isArray(ids_servicios)) {
      throw new AppError("Datos inválidos para asignar servicios", 400);
    }
    
    // conecta con modelo Odontologo. 
    // Ejemplo: const odontologo = await Odontologo.findByPk(id_odontologo);
    // await odontologo.setServicios(ids_servicios);
    throw new AppError("Funcionalidad de relación Odontólogo-Servicio pendiente de implementación", 501);
  }
}

export default ServicioService;