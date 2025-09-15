import { Consultorio } from '../models/indexModel.js';
/**
 * Controlador para gestionar las operaciones relacionadas con el consultorio odontológico.
 * este controlador es basico y no incluye validaciones ni manejo de errores avanzado.
 */
class ConsultorioController {
  async obtenerConsultorios(req, res) {
    try {
      const consultorios = await Consultorio.findAll();
      res.json(consultorios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerConsultorioPorId(req, res) {
    try {
      const consultorio = await Consultorio.findByPk(req.params.id);
      if (!consultorio) return res.status(404).json({ error: 'Consultorio no encontrado' });
      res.json(consultorio);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async crearConsultorio(req, res) {
    try {
      const consultorio = await Consultorio.create(req.body);
      res.status(201).json({
        message: 'Consultorio creado exitosamente',
        consultorio: consultorio
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

    //algunas validaciones
    if (!req.body.nombre || !req.body.direccion) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }


  }

  async actualizarConsultorio(req, res) {
    try {
      const consultorio = await Consultorio.findByPk(req.params.id);
      if (!consultorio) return res.status(404).json({ error: 'Consultorio no encontrado' });
      await consultorio.update(req.body);
      res.json(consultorio);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async eliminarConsultorio(req, res) {
    try {
      const consultorio = await Consultorio.findByPk(req.params.id);
      if (!consultorio) return res.status(404).json({ error: 'Consultorio no encontrado' });
      await consultorio.destroy();
      res.json({ message: 'Consultorio eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ConsultorioController();