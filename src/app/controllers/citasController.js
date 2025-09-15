// Importamos los modelos centralizados y operadores necesarios de Sequelize
import { Cita, Paciente, Odontologo, Servicio, Usuario } from '../models/indexModel.js';
import { Op } from 'sequelize';

/**
 * CitasController
 * Gestiona todas las operaciones CRUD y de estado para las citas.
 */
class CitasController {
  /**
   * Crear una nueva cita.
   * - los pacientes pueden crear citas para sí mismos.
   *  - Si el usuario es un Admin, puede crear una cita para cualquier paciente (enviando pacienteId).
   * - Valida que el horario esté libre, ignorando citas canceladas.
   */
  static async crearCita(req, res) {
    try {
      const usuario = req.usuario; // usuario del token
      let pacienteId = usuario.id; //por defecto es el usuario autenticado
      const { odontologoId, servicioId, fecha, horaInicio } = req.body;
      const rol = usuario.rol; // <-- Y esta línea

      // 1. Validación de datos de entrada
      if (!pacienteId || !odontologoId || !servicioId || !fecha || !horaInicio) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
      }
      
      // (Aquí irían tus otras validaciones de formato de fecha/hora y que no sea en el pasado)
      // Validación de formato de fecha (YYYY-MM-DD) y hora (HH:mm)
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar correos

      if (!fechaRegex.test(fecha)) {
        return res.status(400).json({ error: "El formato de la fecha debe ser YYYY-MM-DD" });
      }
      if (!horaRegex.test(horaInicio)) {
        return res.status(400).json({ error: "El formato de la hora debe ser HH:mm (24 horas)" });
      }
     

      // Validación: la fecha/hora no puede estar en el pasado
      const fechaHoraCita = new Date(`${fecha}T${horaInicio}:00`);
      const ahora = new Date();
      if (fechaHoraCita < ahora) {
        return res.status(400).json({ error: "No se puede agendar una cita en el pasado" });
      }
      // 2. Verificación de disponibilidad del odontólogo
      // Se buscan citas existentes en esa fecha/hora que NO estén canceladas.

      // Verificamos el rol para saber de dónde tomar el ID del paciente o si el ide se envia en el cuerpo
      if (rol === 'admin') {
        // Si es Admin, DEBE enviar el ID del paciente en el cuerpo de la petición.
        if (!req.body.pacienteId) {
                return res.status(400).json({ error: "Como administrador, debes proporcionar el 'pacienteId' para crear la cita." });
            }
            pacienteId = req.body.pacienteId; // Sobrescribimos el pacienteId
        
      } else {
        // Si es Paciente (o cualquier otro rol permitido), se le asigna la cita a sí mismo.
        pacienteId = usuario.id;
      }

      const citaExistente = await Cita.findOne({
        where: {
          odontologoId,
          fecha,
          horaInicio,
          estado: { [Op.not]: 'cancelada' } // Ignoramos las canceladas
        },
      });

      if (citaExistente) {
        return res.status(409).json({ error: "El odontólogo ya tiene una cita programada en ese horario" });
      }

      // 3. Creación de la cita
      const nuevaCita = await Cita.create({
        pacienteId,
        odontologoId,
        servicioId,
        fecha,
        horaInicio,
        // Por defecto, una nueva cita está 'agendada'
        estado: 'agendada'
      });

      res.status(201).json({ message: "Cita creada exitosamente", cita: nuevaCita });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Listar citas.
   * - Admins ven todas las citas.
   * - Odontólogos ven solo las citas asignadas a ellos.
   * - Pacientes ven solo sus propias citas.
   */
  static async listarCitas(req, res) {
    try {
      const usuario = req.usuario;
      const whereClause = {}; // Objeto para construir la consulta dinámicamente

      // Filtramos según el rol del usuario que hace la petición
      if (usuario.rol === 'paciente') {
        whereClause.pacienteId = usuario.id;
      } else if (usuario.rol === 'odontologo') {
        whereClause.odontologoId = usuario.id;
      }
      // Si es 'admin', whereClause queda vacío y se traen todas las citas.

      const citas = await Cita.findAll({
        where: whereClause,
         include: [
        { 
          model: Paciente, 
          as: 'paciente',
          attributes: ['id'],
          include: {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido']
          }
        },
        { 
          model: Odontologo, 
          as: 'odontologo',
          attributes: ['id', 'especialidad'],
          include: {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido']
          }
        },
        { 
          model: Servicio, 
          as: 'servicio',
          attributes: ['nombre', 'precio']
        }
      ],
      order: [['fecha', 'ASC'], ['horaInicio', 'ASC']]
    });

    // Ahora tu código de mapeo para aplanar la respuesta
    const citasPlanas = citas.map(cita => ({
      id: cita.id,
      pacienteId: cita.paciente.id,
      odontologoId: cita.odontologo.id,
      servicioId:cita.servicioId,
      fecha: cita.fecha,
      horaInicio: cita.horaInicio,
      estado: cita.estado,
      nombre: cita.paciente.usuario.nombre,
      apellido: cita.paciente.usuario.apellido
    }));

      res.json(citasPlanas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtener una cita específica por su ID.
   * - Se aplican reglas de propiedad para odontólogos y pacientes.
   */
  static async obtenerCitaPorId(req, res) {
    try {
      // Buscamos la cita por ID, incluyendo los modelos relacionados, podriamos usar include [/**include */]
      const cita = await Cita.findByPk(req.params.id, {
      attributes: ['id', 'fecha', 'horaInicio', 'estado'], // Atributos de la Cita
      include: [
        { 
          model: Paciente, 
          as: 'paciente',
          attributes: ['id'], // Opcional: solo trae el ID de la tabla Paciente
          // --- Include Anidado ---
          include: {
            model: Usuario,
            as: 'usuario', // Asume que la relación Paciente -> Usuario usa este alias
            attributes: ['nombre', 'apellido'] // Atributos de la tabla Usuario
          }
        },
        { 
          model: Odontologo, 
          as: 'odontologo',
          attributes: ['id', 'especialidad'], // Opcional
           // --- Include Anidado ---
          include: {
            model: Usuario,
            as: 'usuario', // Asume que la relación Odontologo -> Usuario usa este alias
            attributes: ['nombre', 'apellido']
          }
        },
        { 
          model: Servicio, 
          as: 'servicio',
          attributes: ['nombre', 'precio']
          
        }
      ]
      });

      if (!cita) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }

      //formato plano para enviar opcionalmente podemos enviar cita completa
      const citaPlano = {
        id: cita.id,
        fecha: cita.fecha,
        horaInicio: cita.horaInicio,
        estado: cita.estado,
        paciente: {
          id: cita.paciente.id,
          nombre: cita.paciente.usuario.nombre,
          apellido: cita.paciente.usuario.apellido
        },
        odontologo: {
          id: cita.odontologo.id,
          nombre: cita.odontologo.usuario.nombre,
          apellido: cita.odontologo.usuario.apellido,
          especialidad: cita.odontologo.especialidad
        },
        servicio: {
          nombre: cita.servicio.nombre,
          precio: cita.servicio.precio
        }
      };

      const usuarioToken = req.usuario;

      // Verificación de permisos: solo el admin, el dueño de la cita o el odontólogo asignado pueden verla, depende como se contruya la cita 
      const esAdmin = usuarioToken.rol === 'admin';
      const esPacientePropietario = usuarioToken.rol === 'paciente' && Number(cita.paciente.id) === Number(usuarioToken.id); // los datos deben coincidir
      const esOdontologoAsignado = usuarioToken.rol === 'odontologo' && Number(cita.odontologo.id) === Number(usuarioToken.id);

      if (!esAdmin && !esPacientePropietario && !esOdontologoAsignado) {
        return res.status(403).json({ error: "Acceso denegado. No tienes permiso para ver esta cita." });
      }

      res.json(citaPlano);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  /**
   * Cancelar una cita (Borrado Lógico).
   * - Acción principal para pacientes.
   * - Cambia el estado de la cita a 'cancelada'.
   * - El registro se mantiene en la base de datos.
   */
  static async cancelarCita(req, res) {
    try {
      const cita = await Cita.findByPk(req.params.id);
      if (!cita) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }

      const usuario = req.usuario;

      // Verificación: Solo el admin o el paciente dueño de la cita pueden cancelarla.
      const esAdmin = usuario.rol === 'admin';
      const esPacientePropietario = usuario.rol === 'paciente' && Number(cita.pacienteId.toString()) === Number(usuario.id);

      if (!esAdmin && !esPacientePropietario) {
        return res.status(403).json({ error: "No tienes permiso para cancelar esta cita, es posible que no seas el dueño o no exista." });
      }

      // Actualizamos solo el estado
      cita.estado = 'cancelada';
      await cita.save();

      res.json({ message: "Cita cancelada correctamente", cita });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Eliminar una cita permanentemente (Borrado Físico).
   * - ¡ACCIÓN DESTRUCTIVA! Solo para administradores.
   * - Elimina el registro de la base de datos.
   */
  static async eliminarCitaDefinitivamente(req, res) {
    try {
      const cita = await Cita.findByPk(req.params.id);
      if (!cita) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }

      // La validación de rol 'admin' se hace en la ruta con un middleware,
      // por lo que aquí asumimos que el permiso ya fue concedido.
      await cita.destroy();

      res.json({ message: "Cita eliminada permanentemente de la base de datos" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Actualizar una cita existente.
   * - Solo el admin o el paciente dueño pueden modificar la cita.
   * - Valida que el nuevo horario esté disponible y que no sea en el pasado.
   */
  static async actualizarCita(req, res) {
    try {
      const cita = await Cita.findByPk(req.params.id);
      if (!cita) {
        return res.status(404).json({ error: "Cita no encontrada" });
      }

      const usuario = req.usuario;
      const esAdmin = usuario.rol === 'admin';
      const esPacientePropietario = usuario.rol === 'paciente' && Number(cita.pacienteId.toString()) === Number(usuario.id);

      if (!esAdmin && !esPacientePropietario) {
        return res.status(403).json({ error: "No tienes permiso para modificar esta cita." });
      }

      // Solo permitimos actualizar ciertos campos
      const { odontologoId, servicioId, fecha, horaInicio } = req.body;

      // Validación de campos (solo si se envían)
      if (fecha) {
        const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!fechaRegex.test(fecha)) {
          return res.status(400).json({ error: "El formato de la fecha debe ser YYYY-MM-DD" });
        }
      }
      if (horaInicio) {
        const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!horaRegex.test(horaInicio)) {
          return res.status(400).json({ error: "El formato de la hora debe ser HH:mm (24 horas)" });
        }
      }
      if (fecha && horaInicio) {
        const fechaHoraCita = new Date(`${fecha}T${horaInicio}:00`);
        const ahora = new Date();
        if (fechaHoraCita < ahora) {
          return res.status(400).json({ error: "No se puede agendar una cita en el pasado" });
        }
      }

      // Si se cambia odontólogo, fecha o hora, verificar disponibilidad
      const nuevoOdontologoId = odontologoId || cita.odontologoId;
      const nuevaFecha = fecha || cita.fecha;
      const nuevaHoraInicio = horaInicio || cita.horaInicio;

      if (
        odontologoId || fecha || horaInicio
      ) {
        const citaExistente = await Cita.findOne({
          where: {
            odontologoId: nuevoOdontologoId,
            fecha: nuevaFecha,
            horaInicio: nuevaHoraInicio,
            estado: { [Op.not]: 'cancelada' },
            id: { [Op.not]: cita.id } // Ignorar la cita actual
          },
        });
        if (citaExistente) {
          return res.status(409).json({ error: "El odontólogo ya tiene una cita programada en ese horario" });
        }
      }

      // Actualizamos los campos permitidos
      if (odontologoId) cita.odontologoId = odontologoId;
      if (servicioId) cita.servicioId = servicioId;
      if (fecha) cita.fecha = fecha;
      if (horaInicio) cita.horaInicio = horaInicio;

      await cita.save();

      res.json({ message: "Cita actualizada correctamente", cita });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default CitasController;