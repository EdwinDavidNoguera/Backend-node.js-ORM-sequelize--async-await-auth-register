// src/app/controllers/serviciosController.js
import Servicio from "../models/serviciosModel.js";  // Importamos el modelo Servicio

/**
 * Este controlador maneja las operaciones CRUD para los servicios ofrecidos por la clínica dental.
 * Incluye métodos para crear, leer, actualizar y eliminar servicios.
 * Se apoya del servicio para la lógica de negocio y validaciones.
 */
class ServicioController {

  // Obtener todos los servicios disponibles
  async obtenerServicios(req, res) {
    try {
      const servicios = await Servicio.findAll();
      res.json(servicios);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener la lista de servicios",
        error: error.message,
      });
    }
  }

  // Obtener un servicio específico por su ID
  async obtenerServicioPorId(req, res) {
    const id = req.params.id;
    try {
      const servicio = await Servicio.findByPk(id);
      
      // Validar si el servicio existe
      if (!servicio) {
        return res.status(404).json({
          message: `No se encontró ningún servicio con el ID ${id}`,
        });
      }

      res.json(servicio);
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener el servicio",
        error: error.message,
      });
    }
  }

  // Crear un nuevo servicio
  async crearServicio(req, res) {
    const { nombre, descripcion, precio, img } = req.body;

    const errores = {};

    // Validaciones mínimas
    if (!nombre) errores.nombre = "El nombre es obligatorio";
    if (!precio) errores.precio = "El precio es obligatorio";
    
    // Si existen errores de validación, devolverlos al cliente
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ errores });
    }

    try {
      // Crear el nuevo registro en la base de datos
      const nuevoServicio = await Servicio.create({
        nombre,
        descripcion,
        precio,
        img,
      });

      res.status(201).json({
        message: "Servicio creado exitosamente",
        servicio: nuevoServicio,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error al crear el servicio",
        error: error.message,
      });
    }
  }

  // Actualizar un servicio existente
  async actualizarServicio(req, res) {
    const id = req.params.id;
    const { nombre, descripcion, precio, img } = req.body;

    try {
      const servicio = await Servicio.findByPk(id);

      // Verificar que el servicio exista antes de actualizarlo
      if (!servicio) {
        return res.status(404).json({ message: "Servicio no encontrado" });
      }

      await servicio.update({ nombre, descripcion, precio, img });

      res.json({ message: "Servicio actualizado correctamente", servicio });
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar el servicio",
        error: error.message,
      });
    }
  }

  // Eliminar un servicio
  async eliminarServicio(req, res) {
    const id = req.params.id;

    try {
      const servicio = await Servicio.findByPk(id);

      // Verificar que el servicio exista antes de eliminarlo
      if (!servicio) {
        return res.status(404).json({ message: "Servicio no encontrado" });
      }

      await servicio.destroy();

      res.json({ message: "Servicio eliminado correctamente" });
    } catch (error) {
      res.status(500).json({
        message: "Error al eliminar el servicio",
        error: error.message,
      });
    }
  }
}

// Exportamos una instancia única del controlador
export default new ServicioController();
