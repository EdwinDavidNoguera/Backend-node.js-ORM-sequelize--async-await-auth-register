import Usuario from "../models/usuariosModel.js";    // Modelo de usuario (datos generales de login y perfil)
import Paciente from "../models/pacientesModel.js";  // Modelo de paciente (datos específicos del paciente)
import bcrypt from 'bcrypt';                         // Librería para encriptar contraseñas

class PacienteController {

  // Obtener todos los pacientes con sus datos de usuario asociados
  async obtenerPacientes(req, res) {
    try {
      const pacientes = await Paciente.findAll({
        include: { model: Usuario, as: "usuario" },  // JOIN con la tabla usuarios
      });

      // Se transforman los datos en un objeto más "aplanado" para el frontend, para facilitar su uso
      const pacientesAplanados = pacientes.map(paciente => {
        return {
          id: paciente.id,
          nombre: paciente.usuario?.nombre,            
          apellido: paciente.usuario?.apellido,        
          email: paciente.usuario?.email,              
          rol: paciente.usuario?.rol,                  
          foto_perfil: paciente.usuario?.foto_perfil,  
          activo: paciente.usuario?.activo,            
          fecha_nacimiento: paciente.fecha_nacimiento, 
          celular: paciente.celular,
          genero: paciente.genero,
        };
      });

      res.json(pacientesAplanados);
      console.log(pacientesAplanados)
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener pacientes",
        error: error.message,
      });
    }
  }

  // Obtener un paciente específico por ID (incluye datos de usuario)
  async obtenerPacientePorId(req, res) {
    const id = req.params.id; // ID pasado en la URL, en el frontend seria /pacientes/:id
    try {
      const paciente = await Paciente.findByPk(id, {
        include: { model: Usuario, as: "usuario" }, // JOIN con usuarios
      });

      if (!paciente) {
        return res.status(404).json({
          message: `No se encontró ningún paciente con el ID ${id}`,
        });
      }

      res.json(paciente); //respuesta con el paciente encontrado
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener paciente",
        error: error.message,
      });
    }
  }

  // Crear un nuevo paciente (crea tanto usuario como paciente en una transacción)
  async crearPaciente(req, res) {
    const {
      nombre,
      apellido,
      email,
      password,
      rol = "paciente", // Por defecto el rol es paciente, el cliente no puede asignar otro rol
      foto_perfil,
      fecha_nacimiento,
      celular,
      genero,
    } = req.body;

    // Objeto para recolectar errores de validación
    const errores = {};

    // Validaciones de campos obligatorios
    if (!nombre) errores.nombre = "El nombre es obligatorio";
    if (!apellido) errores.apellido = "El apellido es obligatorio";
    if (!email) errores.email = "El correo es obligatorio";
    if (!password) errores.password = "La contraseña es obligatoria";
    if (!celular) errores.celular = "El celular es obligatorio";
    if (!fecha_nacimiento) errores.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    if (!genero) errores.genero = "El género es obligatorio";

    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ errores });
    }

    // Regex para validaciones de seguridad
    const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const regexCelular = /^[0-9]{10}$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validación de email
    if (!regexEmail.test(email)) {
      errores.email = "El correo electrónico no es válido";
    }

    // Validación de contraseña fuerte
    if (!regexPassword.test(password)) {
      errores.password = "Contraseña insegura. Debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";
    }

    // Validación de celular
    if (!regexCelular.test(celular)) {
      errores.celular = "Celular inválido. Debe contener exactamente 10 dígitos.";
    }

    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ errores });
    }

    // Transacción para asegurar que usuario y paciente se creen juntos
    const t = await Usuario.sequelize.transaction();

    try {
      // Encriptar la contraseña antes de guardar
      const hashedPassword = await bcrypt.hash(password, 10);

      // Verificar si el email ya existe en la base de datos
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(409).json({ message: "El correo ya está registrado" }); //en la respuesta
      }

      // Crear usuario
      const nuevoUsuario = await Usuario.create(
        {
          nombre,
          apellido,
          email,
          password: hashedPassword,
          rol,
          foto_perfil,
        },
        { transaction: t }
      );

      // Crear paciente asociado al usuario
      const nuevoPaciente = await Paciente.create(
        {
          id: nuevoUsuario.id, // Se asegura la relación uno a uno
          fecha_nacimiento,
          celular,
          genero,
        },
        { transaction: t }
      );

      await t.commit(); // Confirmar la transacción

      res.status(201).json({
        message: "Paciente creado exitosamente",
        usuario: nuevoUsuario,
        paciente: nuevoPaciente,
      });
    } catch (error) {
      await t.rollback(); // Revertir en caso de error
      res.status(500).json({
        message: "Error al crear paciente",
        error: error.message,
      });
    }
  }

  // Actualizar datos de un paciente (si es rol "paciente", solo puede modificar su propio perfil)
  async actualizarPaciente(req, res) {
    const id = req.params.id;
    const rolUsuario = req.usuario.rol;    // Rol tomado del token
    const idUsuario = req.usuario.id;      // ID tomado del token

    // Restringir que un paciente edite los datos de otro
    if (rolUsuario === 'paciente' && idUsuario !== id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para modificar otro paciente' });
    }

    const {
      nombre,
      apellido,
      email,
      password,
      rol,
      foto_perfil,
      fecha_nacimiento,
      celular,
      genero
    } = req.body;

    try {
      const usuario = await Usuario.findByPk(id);
      const paciente = await Paciente.findByPk(id);

      if (!usuario || !paciente) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      const emailduplicado= await Usuario.findOne({ where: { email } });
      if (emailduplicado)
        return res.status(409).json({ message: "El correo ya está registrado por otro usuario" });

      // Actualizar ambos registros (usuario y paciente)
      await usuario.update({ nombre, apellido, email, password, rol, foto_perfil });
      await paciente.update({ fecha_nacimiento, celular, genero });

      res.json({ message: "Paciente actualizado correctamente" });
    } catch (error) {
      res.status(500).json({
        message: "Error al actualizar paciente",
        error: error.message,
      });
    }
  }

  // Eliminar un paciente y su usuario asociado
  async eliminarPaciente(req, res) {
    const id = req.params.id;
    const t = await Usuario.sequelize.transaction();

    try {
      const paciente = await Paciente.findByPk(id);
      const usuario = await Usuario.findByPk(id);

      if (!paciente || !usuario) {
        return res.status(404).json({ message: "Paciente no encontrado" });
      }

      // Eliminar primero el paciente y luego el usuario (transacción)
      await paciente.destroy({ transaction: t });
      await usuario.destroy({ transaction: t });

      await t.commit();

      res.json({ message: "Paciente y usuario eliminados correctamente" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({
        message: "Error al eliminar paciente",
        error: error.message,
      });
    }
  }
}

// Exportamos instancia lista para usarse en las rutas
export default new PacienteController();
