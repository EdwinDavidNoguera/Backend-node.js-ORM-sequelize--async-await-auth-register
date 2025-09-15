// Importa los modelos necesarios desde el archivo central de modelos
import { Historial, Paciente, Consulta, Tratamiento } from '../models/indexModel.js';

//✅✅✅✅✅✅✅✅✅✅✅✅

// Define la clase del controlador de historiales odontológicos
class HistorialController {

  /**
   * Obtener todos los historiales según el rol del usuario
   * - Paciente: solo ve su propio historial
   * - Odontólogo/Admin: pueden ver todos los historiales en general
   * Se apoya de las relaciones definidas en los modelos para incluir datos relacionados
   * como paciente, consultas y tratamientos.
   */

  async obtenerHistoriales(req, res) {
    try {
      const { rol } = req.usuario; // Extrae el rol del usuario autenticado

      // Caso 1: si el rol es "paciente"
      if (rol === 'paciente') {
        const historial = await Historial.findOne({
          where: { pacienteId: req.usuario.id },
          include: [
            { model: Paciente, as: 'paciente' },
            { model: Consulta, as: 'consultas', order: [['createdAt', 'DESC']] },
            { model: Tratamiento, as: 'tratamientos' } // 👈 acceso directo a tratamientos
          ]
        });

        if (!historial) {
          return res.status(404).json({
            error: `No se encontró historial para el paciente con nombre ${req.usuario.nombre}.`
          });
        }

        const historialAplanado = {
          id: historial.id,
          fecha: historial.createdAt,
          diagnostico: historial.diagnosticoGeneral,
          observaciones: historial.observaciones,
          antecedentesMedicos: historial.antecedentesMedicos,
          paciente: historial.paciente
            ? {
                nombre: historial.paciente.nombre,
                apellido: historial.paciente.apellido,
                cedula: historial.paciente.cedula,
                telefono: historial.paciente.telefono,
                edad: historial.paciente.edad
              }
            : null,
          ultimoOdontologo: historial.consultas.length
            ? historial.consultas[0].odontologoId
            : null,
          tratamientos: historial.tratamientos.map((t) => ({
            id: t.id,
            nombre: t.nombre,
            fecha: t.fecha,
            costo: t.costo
          }))
        };

        return res.json(historialAplanado);
      }

      // Caso 2: si el rol es "admin" o "odontólogo"
      if (rol === 'admin' || rol === 'odontologo') {
        const historiales = await Historial.findAll({
          include: [
            { model: Paciente, as: 'paciente' },
            { model: Consulta, as: 'consultas', order: [['createdAt', 'DESC']] },
            { model: Tratamiento, as: 'tratamientos' }
          ]
        });

        if (!historiales || historiales.length === 0) {
          return res.status(404).json({ error: 'No se encontraron historiales.' });
        }

        const historialesAplanados = historiales.map((historial) => ({
          id: historial.id,
          fecha: historial.createdAt,
          diagnostico: historial.diagnosticoGeneral,
          observaciones: historial.observaciones,
          antecedentesMedicos: historial.antecedentesMedicos,
          paciente: historial.paciente
            ? {
                nombre: historial.paciente.nombre,
                apellido: historial.paciente.apellido,
                cedula: historial.paciente.cedula,
                telefono: historial.paciente.telefono,
                edad: historial.paciente.edad
              }
            : null,
          tratamientos: historial.tratamientos.map((t) => ({
            id: t.id,
            nombre: t.nombre,
            fecha: t.fecha,
            costo: t.costo
          }))
        }));

        return res.json(historialesAplanados);
      }

      // Si el rol no es válido, devuelve error 403
      return res.status(403).json({ error: 'No tienes permiso para ver historiales.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener un historial específico por ID
   * - Paciente: solo puede ver su propio historial
   * - Admin/Odontólogo: pueden ver cualquier historial
   */
  async obtenerHistorialPorId(req, res) {
    try {
      const { rol, id } = req.usuario;

      const historial = await Historial.findByPk(req.params.id, {
        include: [
          { model: Paciente, as: 'paciente' },
          { model: Consulta, as: 'consultas', order: [['createdAt', 'DESC']] },
          { model: Tratamiento, as: 'tratamientos' }
        ]
      });

      if (!historial) {
        return res.status(404).json({ error: 'Historial no encontrado.' });
      }

      if (rol === 'paciente' && historial.pacienteId !== id) {
        return res
          .status(403)
          .json({ error: 'No tienes permiso para ver este historial.' });
      }

      return res.json(historial);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Crear un nuevo historial odontológico
   */
  async crearHistorial(req, res) {
    try {
      const { rol } = req.usuario;

      if (rol !== 'admin' && rol !== 'odontologo') {
        return res
          .status(403)
          .json({ error: 'Solo odontólogos o administradores pueden crear historiales.' });
      }

      const { pacienteId, diagnosticoGeneral, observaciones, antecedentesMedicos } = req.body;

      if (!pacienteId) {
        return res.status(400).json({ error: 'El campo pacienteId es obligatorio.' });
      }

      const paciente = await Paciente.findByPk(pacienteId);
      if (!paciente) {
        return res.status(404).json({ error: 'El paciente no existe.' });
      }

      if (diagnosticoGeneral && typeof diagnosticoGeneral !== 'string') {
        return res.status(400).json({ error: 'Diagnóstico debe ser texto.' });
      }
      if (observaciones && typeof observaciones !== 'string') {
        return res.status(400).json({ error: 'Observaciones debe ser texto.' });
      }
      if (antecedentesMedicos && typeof antecedentesMedicos !== 'string') {
        return res.status(400).json({ error: 'Antecedentes médicos debe ser texto.' });
      }

      const historial = await Historial.create({
        pacienteId,
        diagnosticoGeneral,
        observaciones,
        antecedentesMedicos
      });

      res.status(201).json(historial);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Actualizar un historial odontológico existente
   */
  async actualizarHistorial(req, res) {
    try {
      const { rol } = req.usuario;

      const historial = await Historial.findByPk(req.params.id);
      if (!historial) {
        return res.status(404).json({ error: 'Historial no encontrado.' });
      }

      if (rol !== 'admin' && rol !== 'odontologo') {
        return res
          .status(403)
          .json({ error: 'No tienes permiso para actualizar este historial.' });
      }

      const { diagnosticoGeneral, observaciones, antecedentesMedicos } = req.body;

      if (diagnosticoGeneral && typeof diagnosticoGeneral !== 'string') {
        return res.status(400).json({ error: 'Diagnóstico debe ser texto.' });
      }
      if (observaciones && typeof observaciones !== 'string') {
        return res.status(400).json({ error: 'Observaciones debe ser texto.' });
      }
      if (antecedentesMedicos && typeof antecedentesMedicos !== 'string') {
        return res.status(400).json({ error: 'Antecedentes médicos debe ser texto.' });
      }

      await historial.update({
        diagnosticoGeneral: diagnosticoGeneral?.trim() ?? historial.diagnosticoGeneral,
        observaciones: observaciones?.trim() ?? historial.observaciones,
        antecedentesMedicos: antecedentesMedicos?.trim() ?? historial.antecedentesMedicos
      });

      res.json(historial);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Eliminar un historial odontológico
   */
  async eliminarHistorial(req, res) {
    try {
      const { rol } = req.usuario;

      const historial = await Historial.findByPk(req.params.id);
      if (!historial) {
        return res.status(404).json({ error: 'Historial no encontrado.' });
      }

      if (rol !== 'admin') {
        return res
          .status(403)
          .json({ error: 'Solo el administrador puede eliminar historiales.' });
      }

      await historial.destroy();
      res.json({ message: 'Historial eliminado correctamente.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// Exporta una instancia del controlador para usar en las rutas
export default new HistorialController();
