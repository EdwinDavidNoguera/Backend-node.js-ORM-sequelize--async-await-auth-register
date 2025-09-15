import OdontologoService from "../services/odontologosServices.js";

/**
 * Este controlador maneja las operaciones CRUD para los odontólogos de la clínica dental.
 * Incluye métodos para crear, leer, actualizar y eliminar registros de odontólogos.
 * Se apoya del servicio de odontólogos para la lógica de negocio y validaciones.
 */
class OdontologoController {
  // Crear un nuevo odontólogo
  async crearOdontologo(req, res, next) {
    try {
      const resultado = await OdontologoService.crearOdontologo(req.body);
      res.status(201).json({
        status: "success",
        message: "Odontólogo creado correctamente",
        data: resultado,
      });
    } catch (error) {
      // Pasa el error al siguiente middleware (manejador de errores)
      next(error);
    }
  }

  // Obtener todos los odontólogos disponibles
  async obtenerOdontologos(req, res, next) {
    try {
      const odontologos = await OdontologoService.obtenerOdontologos();
      res.status(200).json({
        status: "success",
        data: odontologos,
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener un odontólogo específico por su ID
  async obtenerOdontologoPorId(req, res, next) {
    try {
      const odontologo = await OdontologoService.obtenerOdontologoPorId(
        req.params.id
      );
      res.status(200).json({
        status: "success",
        data: odontologo,
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar un odontólogo existente
  async actualizarOdontologo(req, res, next) {
    try {
      const resultado = await OdontologoService.actualizarOdontologo(
        req.params.id,
        req.body
      );
      res.status(200).json({
        status: "success",
        message: "Odontólogo actualizado correctamente",
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar un odontólogo
  async eliminarOdontologo(req, res, next) {
    try {
      await OdontologoService.eliminarOdontologo(req.params.id);
      res.status(200).json({
        status: "success",
        message: "Odontólogo eliminado correctamente",
      });
    } catch (error) {
      next(error);
    }
  }
}

// Exportamos una instancia única del controlador para mantener el patrón Singleton
export default new OdontologoController();
