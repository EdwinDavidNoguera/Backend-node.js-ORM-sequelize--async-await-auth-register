import { Tratamiento, Odontologo, Historial, Cita, Consulta } from '../models/indexModel.js';
//trabajando aqui
class TratamientoController {

  // ✅ Obtener tratamientos según rol
  async obtenerTratamientos(req, res) {
    try {
      let tratamientos;

      if (req.user.rol === "paciente") {
        tratamientos = await Tratamiento.findAll({
          include: [
            {
              model: Historial,
              as: "historial",
              where: { pacienteId: req.user.id },
              include: ["paciente"]
            },
            "odontologo"
          ]
        });
      } else if (req.user.rol === "odontologo" || req.user.rol === "admin") {
        tratamientos = await Tratamiento.findAll({
          include: ["odontologo", "historial"]
        });
      } else {
        return res.status(403).json({ error: "Rol no autorizado" });
      }

      res.json(tratamientos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ Obtener tratamiento por ID según rol
  async obtenerTratamientoPorId(req, res) {
    try {
      let tratamiento;

      if (req.user.rol === "paciente") {
        tratamiento = await Tratamiento.findOne({
          where: { id: req.params.id },
          include: [
            {
              model: Historial,
              as: "historial",
              where: { pacienteId: req.user.id },
              include: ["paciente"]
            },
            "odontologo"
          ]
        });
      } else if (req.user.rol === "odontologo" || req.user.rol === "admin") {
        tratamiento = await Tratamiento.findByPk(req.params.id, {
          include: ["odontologo", "historial"]
        });
      }

      if (!tratamiento) {
        return res.status(404).json({ error: "Tratamiento no encontrado" });
      }

      res.json(tratamiento);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ Crear tratamiento
  async crearTratamiento(req, res) {
    try {
      const errores = {};
      const { odontologoId, historialId, citaId, ...datosTratamiento } = req.body;

      // Validar odontólogo
      const odontologo = await Odontologo.findByPk(odontologoId);
      if (!odontologo) errores.odontologoId = "El odontólogo no existe";

      // Validar historial
      const historial = await Historial.findByPk(historialId);
      if (!historial) errores.historialId = "El historial no existe";

      // Validar la consulta
      const consulta = await Consulta.findByPk(consulta.id);
      if (!consulta) errores.consultaId = "La consulta no existe";  

      // Validaciones del tratamiento
      if (!datosTratamiento.descripcion?.trim()) errores.descripcion = "Debe enviar una descripción";
      if (!datosTratamiento.tipo) errores.tipo = "Debe enviar el tipo de tratamiento";
      if (!datosTratamiento.fecha_inicio) errores.fecha_inicio = "Debe enviar la fecha de inicio";
      if (!datosTratamiento.fecha_fin) errores.fecha_fin = "Debe enviar la fecha de fin";
      if (!datosTratamiento.costo || isNaN(datosTratamiento.costo)) errores.costo = "Debe enviar un costo válido";
    
      if (datosTratamiento.estado && !["pendiente", "en_proceso", "finalizado", "cancelado"].includes(datosTratamiento.estado)) {
        errores.estado = "El estado no es válido";
      }

      if (Object.keys(errores).length > 0) {
        return res.status(400).json({ message: "Errores de validación", errores });
      }

      const tratamiento = await Tratamiento.create({
        odontologoId,
        historialId,
        citaId: citaId || null,
        ...datosTratamiento
      });

      res.status(201).json(tratamiento);
    } catch (error) {
      res.status(500).json({ message: "Error al crear tratamiento", error: error.message });
    }
  }

  // ✅ Actualizar tratamiento
  async actualizarTratamiento(req, res) {
    try {
      const { odontologoId, historialId, citaId, ...datosTratamiento } = req.body;
      const errores = {};

      // Validaciones
      if (!odontologoId) errores.odontologoId = "El ID del odontólogo es obligatorio";
      if (!historialId) errores.historialId = "El ID del historial es obligatorio";

      const odontologo = await Odontologo.findByPk(odontologoId);
      if (!odontologo) errores.odontologoId = "El odontólogo no existe";

      const historial = await Historial.findByPk(historialId);
      if (!historial) errores.historialId = "El historial no existe";

      if (!datosTratamiento.tipo_de_tratamiento) errores.tipo_de_tratamiento = "El tipo de tratamiento es obligatorio";
      if (!datosTratamiento.fecha_inicio) errores.fecha_inicio = "La fecha de inicio es obligatoria";

      if (datosTratamiento.fecha_fin && new Date(datosTratamiento.fecha_fin) < new Date(datosTratamiento.fecha_inicio)) {
        errores.fecha_fin = "La fecha de fin debe ser posterior a la fecha de inicio";
      }

      if (!datosTratamiento.costo || isNaN(datosTratamiento.costo)) errores.costo = "El costo debe ser un número válido";

      if (datosTratamiento.estado && !["pendiente", "en_proceso", "finalizado", "cancelado"].includes(datosTratamiento.estado)) {
        errores.estado = "El estado no es válido";
      }

      if (Object.keys(errores).length > 0) {
        return res.status(400).json({ errores });
      }

      const tratamiento = await Tratamiento.findByPk(req.params.id);
      if (!tratamiento) return res.status(404).json({ error: "Tratamiento no encontrado" });

      await tratamiento.update({ odontologoId, historialId, citaId: citaId || null, ...datosTratamiento });

      res.json(tratamiento);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ✅ Eliminar tratamiento
  async eliminarTratamiento(req, res) {
    try {
      const tratamiento = await Tratamiento.findByPk(req.params.id);
      if (!tratamiento) return res.status(404).json({ error: "Tratamiento no encontrado" });

      await tratamiento.destroy();
      res.json({ message: "Tratamiento eliminado correctamente" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new TratamientoController();
