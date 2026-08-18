import Servicio from "../models/serviciosModel.js";
import AppError from "../utils/errors/appError.js";
import fs from "fs";
import path from "path";

class ServicioService {

  /**
   * Ruta física de la carpeta donde se almacenan las imágenes.
   */
  static rutaUploads = path.resolve(
    "src/app/uploads/servicios"
  );

  /**
   * Nombre de la imagen por defecto.
   */
  static imagenPorDefecto = "servicio-default.png";

  /**
   * Valida que los campos necesarios para un servicio
   * hayan sido proporcionados.
   */
  static validarCamposObligatorios(
    nombre,
    costo,
    duracion_minutos
  ) {

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

  /**
   * Valida que el costo y la duración
   * tengan valores numéricos válidos.
   */
  static validarValoresNumericos(
    costo,
    duracion_minutos
  ) {

    const costoNumero = Number(costo);

    const duracionNumero =
      Number(duracion_minutos);

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

  /**
   * Verifica que no exista otro servicio
   * con el mismo nombre.
   */
  static async validarNombreDuplicado(
    nombre,
    id = null
  ) {

    const servicioExistente =
      await Servicio.findOne({
        where: {
          nombre: nombre.trim()
        }
      });

    if (!servicioExistente) return;

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
   * Comprueba si una imagen existe físicamente.
   *
   * Si no existe, devuelve la imagen por defecto.
   *
   * También normaliza la ruta de la imagen
   * por defecto.
   */
  static obtenerImagenValida(img) {

    /*
     * Si no hay imagen registrada,
     * utilizar la imagen por defecto.
     */
    if (!img) {

      return `/uploads/servicios/${this.imagenPorDefecto}`;

    }

    /*
     * Extraer solamente el nombre del archivo.
     */
    const nombreArchivo =
      path.basename(img);

    /*
     * Si es la imagen por defecto,
     * devolver siempre la ruta completa.
     */
    if (
      nombreArchivo ===
      this.imagenPorDefecto
    ) {

      return `/uploads/servicios/${this.imagenPorDefecto}`;

    }

    /*
     * Ruta física completa de la imagen.
     */
    const rutaImagen =
      path.join(
        this.rutaUploads,
        nombreArchivo
      );

    /*
     * Comprobar si realmente existe.
     */
    if (!fs.existsSync(rutaImagen)) {

      console.log(
        `Imagen no encontrada: ${rutaImagen}`
      );

      console.log(
        `Se utilizará la imagen por defecto.`
      );

      return `/uploads/servicios/${this.imagenPorDefecto}`;

    }

    /*
     * La imagen existe.
     */
    return `/uploads/servicios/${nombreArchivo}`;

  }

  /**
   * Verifica la imagen de un servicio
   * antes de devolverlo.
   */
  static validarImagenServicio(servicio) {

    if (!servicio) return servicio;

    const imagenValida =
      this.obtenerImagenValida(
        servicio.img
      );

    /*
     * Modificamos únicamente la respuesta
     * que se devolverá.
     */
    servicio.img = imagenValida;

    return servicio;

  }

  /**
   * Crea un nuevo servicio odontológico.
   */
  static async crear(datos, archivo) {

    const {
      nombre,
      costo,
      duracion_minutos,
      descripcion
    } = datos;

    this.validarCamposObligatorios(
      nombre,
      costo,
      duracion_minutos
    );

    this.validarValoresNumericos(
      costo,
      duracion_minutos
    );

    await this.validarNombreDuplicado(
      nombre
    );

    const servicio =
      await Servicio.create({

        nombre: nombre.trim(),

        costo: Number(costo),

        duracion_minutos:
          Number(duracion_minutos),

        descripcion:
          descripcion || null,

        activo: true,

        /*
         * Si se proporciona una imagen,
         * guardar su ruta.
         *
         * Si no se proporciona,
         * el modelo puede utilizar
         * la imagen por defecto.
         */
        ...(archivo && {
          img:
            `/uploads/servicios/${archivo.filename}`
        })

      });

    /*
     * Verificar que la imagen registrada
     * realmente exista.
     */
    return this.validarImagenServicio(
      servicio
    );

  }

  /**
   * Obtiene todos los servicios activos.
   *
   * Si alguna imagen fue eliminada físicamente,
   * se utilizará automáticamente la imagen
   * por defecto.
   */
  static async obtenerTodosServicios() {

    const servicios =
      await Servicio.findAll({
        where: {
          activo: true
        }
      });

    return servicios.map(
      servicio =>
        this.validarImagenServicio(servicio)
    );

  }

  /**
   * Obtiene un servicio mediante
   * su identificador.
   */
  static async obtenerPorId(id) {

    const servicio =
      await Servicio.findByPk(id);

    if (!servicio) {

      throw new AppError(
        "Servicio no encontrado",
        404
      );

    }

    return this.validarImagenServicio(
      servicio
    );

  }

  /**
   * Actualiza un servicio.
   *
   * Si se carga una nueva imagen:
   *
   * 1. Multer guarda la nueva imagen.
   * 2. Se actualiza la ruta en SQL.
   * 3. Se elimina físicamente la imagen anterior.
   */
  static async actualizar(
    id,
    datos,
    archivo
  ) {

    const servicio =
      await Servicio.findByPk(id);

    if (!servicio) {

      throw new AppError(
        "Servicio no encontrado",
        404
      );

    }

    const {
      nombre,
      costo,
      duracion_minutos,
      descripcion,
      activo
    } = datos;

    if (nombre) {

      await this.validarNombreDuplicado(
        nombre,
        id
      );

    }

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

    /*
     * Guardamos la imagen anterior
     * antes de actualizar.
     */
    const imagenAnterior =
      servicio.img;

    /*
     * Construimos la nueva imagen.
     */
    const nuevaImagen =
      archivo
        ? `/uploads/servicios/${archivo.filename}`
        : servicio.img;

    /*
     * Actualizamos el servicio.
     */
    await servicio.update({

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

      img: nuevaImagen,

      activo:
        activo !== undefined
          ? activo
          : servicio.activo

    });

    /*
     * Si se cargó una nueva imagen,
     * eliminamos físicamente la anterior.
     */
    if (
      archivo &&
      imagenAnterior
    ) {

      const nombreImagenAnterior =
        path.basename(
          imagenAnterior
        );

      /*
       * Nunca eliminar la imagen por defecto.
       */
      if (
        nombreImagenAnterior !==
        this.imagenPorDefecto
      ) {

        const rutaImagenAnterior =
          path.join(
            this.rutaUploads,
            nombreImagenAnterior
          );

        if (
          fs.existsSync(
            rutaImagenAnterior
          )
        ) {

          fs.unlinkSync(
            rutaImagenAnterior
          );

          console.log(
            `Imagen anterior eliminada: ${rutaImagenAnterior}`
          );

        }

      }

    }

    return this.validarImagenServicio(
      servicio
    );

  }

  /**
   * Elimina completamente un servicio.
   *
   * También elimina físicamente su imagen,
   * excepto si utiliza la imagen por defecto.
   */
  static async eliminar(id) {

    const servicio =
      await Servicio.findByPk(id);

    if (!servicio) {

      throw new AppError(
        "Servicio no encontrado",
        404
      );

    }

    /*
     * Guardamos la imagen antes de eliminar
     * el registro de la base de datos.
     */
    const imagen =
      servicio.img;

    /*
     * Eliminar el registro de SQL.
     */
    await servicio.destroy();

    /*
     * Obtener solamente el nombre del archivo.
     */
    if (imagen) {

      const nombreImagen =
        path.basename(imagen);

      /*
       * Nunca eliminar la imagen por defecto.
       */
      if (
        nombreImagen !==
        this.imagenPorDefecto
      ) {

        const rutaImagen =
          path.join(
            this.rutaUploads,
            nombreImagen
          );

        /*
         * Si el archivo existe,
         * eliminarlo físicamente.
         */
        if (
          fs.existsSync(rutaImagen)
        ) {

          fs.unlinkSync(
            rutaImagen
          );

          console.log(
            `Imagen del servicio eliminada: ${rutaImagen}`
          );

        }

      }

    }

    return servicio;

  }

}

export default ServicioService;