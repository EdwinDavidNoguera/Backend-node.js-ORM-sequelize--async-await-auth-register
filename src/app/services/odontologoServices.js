import Odontologo from "../models/odontologoModel.js";
import PerfilOdontologo from "../models/perfilOdontologoModel.js";
import UsuarioService from "./usuarioService.js";
import sequelize from "../models/db.js";
import AppError from "../utils/errors/appError.js";

import fs from "fs";
import path from "path";


class OdontologoService {


  // Configuración de imágenes.

  static rutaUploads = path.resolve(
    "src/app/uploads/perfiles_odontologos"
  );

  static imagenPorDefecto =
    "perfil-default.png";


  // Validaciones del formulario.

  static validarFormularioOdontologo(
    datos,
    opciones = {}
  ) {

    const {
      requierePassword = false,
      esActualizacion = false
    } = opciones;


    const {
      nombre,
      apellido,
      cedula,
      celular,
      email,
      password
    } = datos;


    const errores = {};


    // ==========================================
    // 1. VALIDACIONES DE PRESENCIA
    // ==========================================

    if (!esActualizacion) {

      if (
        !nombre ||
        nombre.trim() === ""
      ) {

        errores.nombre =
          "El nombre es obligatorio";

      }


      if (
        !apellido ||
        apellido.trim() === ""
      ) {

        errores.apellido =
          "El apellido es obligatorio";

      }


      if (
        !cedula ||
        cedula.trim() === ""
      ) {

        errores.cedula =
          "La cédula es obligatoria";

      }


      if (
        !celular ||
        celular.trim() === ""
      ) {

        errores.celular =
          "El número celular es obligatorio";

      }


      if (
        !email ||
        email.trim() === ""
      ) {

        errores.email =
          "El correo electrónico es obligatorio";

      }

    }


    // ==========================================
    // 2. VALIDACIÓN DE EMAIL
    // ==========================================

    if (
      email &&
      email.trim() !== ""
    ) {

      const regexEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (
        !regexEmail.test(
          email.trim()
        )
      ) {

        errores.email =
          "El correo electrónico no es válido";

      }

    }


    // ==========================================
    // 3. VALIDACIÓN DE CELULAR
    // ==========================================

    if (
      celular &&
      celular.trim() !== ""
    ) {

      const celularLimpio =
        celular.trim();


      if (
        celularLimpio.length !== 10
      ) {

        errores.celular =
          "El celular debe tener exactamente 10 dígitos";


      } else if (
        !/^\d+$/.test(
          celularLimpio
        )
      ) {

        errores.celular =
          "El celular solo debe contener números";

      }

    }


    // ==========================================
    // 4. VALIDACIÓN DE CONTRASEÑA
    // ==========================================

    if (
      requierePassword &&
      !password
    ) {

      errores.password =
        "La contraseña es obligatoria para la cuenta del odontólogo";


    } else if (password) {

      const regexPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;


      if (
        !regexPassword.test(
          password
        )
      ) {

        errores.password =
          "La contraseña debe tener mínimo 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.";

      }

    }


    // ==========================================
    // DEVOLVER ERRORES
    // ==========================================

    if (
      Object.keys(errores).length > 0
    ) {

      throw new AppError(
        "Error de validación en el formulario",
        400,
        errores
      );

    }

  }


  // Elimina una imagen física que ya no se utiliza.

  static eliminarImagenFisica(img) {

    if (!img) {
      return;
    }


    const nombreArchivo =
      path.basename(img);


    // Conserva la imagen predeterminada.

    if (
      nombreArchivo ===
      this.imagenPorDefecto
    ) {

      return;

    }


    const rutaImagen =
      path.join(
        this.rutaUploads,
        nombreArchivo
      );


    if (
      fs.existsSync(
        rutaImagen
      )
    ) {

      fs.unlinkSync(
        rutaImagen
      );


      console.log(
        `Imagen eliminada correctamente: ${rutaImagen}`
      );

    }

  }


  // Normaliza la ruta de la imagen devuelta al cliente.

  static obtenerImagenValida(img) {


    // Usa la imagen predeterminada cuando no existe una imagen.

    if (!img) {

      return `/uploads/perfiles_odontologos/${this.imagenPorDefecto}`;

    }


    // Obtiene únicamente el nombre del archivo.

    const nombreArchivo =
      path.basename(img);


    // Devuelve la ruta de la imagen predeterminada.

    if (
      nombreArchivo ===
      this.imagenPorDefecto
    ) {

      return `/uploads/perfiles_odontologos/${this.imagenPorDefecto}`;

    }


    // Construye la ruta física de la imagen.

    const rutaImagen =
      path.join(
        this.rutaUploads,
        nombreArchivo
      );


    // Comprueba que la imagen exista.

    if (
      !fs.existsSync(
        rutaImagen
      )
    ) {

      console.log(
        `Imagen de perfil no encontrada: ${rutaImagen}`
      );


      console.log(
        "Se utilizará la imagen por defecto."
      );


      return `/uploads/perfiles_odontologos/${this.imagenPorDefecto}`;

    }


    // Devuelve la ruta de la imagen existente.
    return `/uploads/perfiles_odontologos/${nombreArchivo}`;

  }


  // Normaliza la imagen del perfil.

  static normalizarPerfil(perfil) {

    if (!perfil) {
      return perfil;
    }


    perfil.img =
      this.obtenerImagenValida(
        perfil.img
      );


    return perfil;

  }


  // Crea un odontólogo y sus datos asociados.

  static async crearOdontologo(
    datos,
    archivo
  ) {


    const {
      nombre,
      apellido,
      cedula,
      celular,
      numero_licencia,
      id_consultorio,
      email,
      password,
      avatar,

      // Datos del perfil profesional.

      titulo_profesional,
      universidad,
      especialidad,
      fecha_inicio_ejercicio

    } = datos;


    // Valida los datos del odontólogo.

    this.validarFormularioOdontologo(
      datos,
      {
        requierePassword: true
      }
    );


    // Valida los datos del perfil profesional.

    const erroresPerfil = {};


    if (
      !titulo_profesional ||
      titulo_profesional.trim() === ""
    ) {

      erroresPerfil.titulo_profesional =
        "El título profesional es obligatorio";

    }


    if (
      Object.keys(erroresPerfil).length > 0
    ) {

      throw new AppError(
        "Error de validación en el perfil profesional",
        400,
        erroresPerfil
      );

    }


    // Inicia la transacción de registro.

    const transaction =
      await sequelize.transaction();


    try {


      // Comprueba que la cédula no esté registrada.

      const cedulaExistente =
        await Odontologo.findOne({

          where: {
            cedula: cedula.trim()
          },

          transaction

        });


      if (cedulaExistente) {

        throw new AppError(
          "La cédula ya está registrada",
          409,
          {
            cedula:
              "La cédula ya está registrada"
          }
        );

      }


      // Crea el usuario asociado.

      const nuevoUsuario =
        await UsuarioService.crearUsuario(

          {
            email:
              email.trim(),

            password,

            rol:
              "ODONTOLOGO",

            avatar:
              avatar ||
              "default-avatar.png"

          },

          {
            transaction
          }

        );


      // Excluye la contraseña de la respuesta.

      const usuarioSinPassword =
        nuevoUsuario.toJSON();


      delete usuarioSinPassword.password;


      // Crea el odontólogo asociado.

      const nuevoOdontologo =
        await Odontologo.create(

          {

            id_usuario:
              nuevoUsuario.id,

            id_consultorio:
              id_consultorio ||
              null,

            nombre:
              nombre.trim(),

            apellido:
              apellido.trim(),

            cedula:
              cedula.trim(),

            celular:
              celular.trim(),

            numero_licencia:
              numero_licencia ||
              null

          },

          {
            transaction
          }

        );


      // Crea el perfil profesional.

      const nuevoPerfil =
        await PerfilOdontologo.create(

          {

            id_odontologo:
              nuevoOdontologo.id,

            titulo_profesional:
              titulo_profesional.trim(),

            universidad:
              universidad ||
              null,

            especialidad:
              especialidad ||
              null,

            fecha_inicio_ejercicio:
              fecha_inicio_ejercicio ||
              null,

            img:
              archivo
                ? `/uploads/perfiles_odontologos/${archivo.filename}`
                : undefined

          },

          {
            transaction
          }

        );


      // ==========================================
      // CONFIRMAR TRANSACCIÓN
      // ==========================================

      await transaction.commit();


      // ==========================================
      // NORMALIZAR IMAGEN DE RESPUESTA
      // ==========================================

      this.normalizarPerfil(
        nuevoPerfil
      );


      // ==========================================
      // RESPUESTA
      // ==========================================

      return {

        usuario:
          usuarioSinPassword,

        odontologo:
          nuevoOdontologo,

        perfil:
          nuevoPerfil

      };


    } catch (error) {


      // ==========================================
      // ROLLBACK
      // ==========================================

      await transaction.rollback();


      // ==========================================
      // ELIMINAR IMAGEN SI FALLÓ
      // ==========================================

      if (archivo) {

        this.eliminarImagenFisica(
          archivo.filename
        );

      }


      throw error;

    }

  }


  // ==========================================
  // OBTENER TODOS LOS ODONTÓLOGOS
  // ==========================================

  static async obtenerOdontologos() {


    const odontologos =
      await Odontologo.findAll({

        include: [

          // ==========================================
          // USUARIO
          // ==========================================

          {

            association:
              "usuario",

            attributes: {
              exclude: [
                "password"
              ]
            }

          },


          // ==========================================
          // PERFIL
          // ==========================================

          {

            association:
              "perfil"

          }

        ]

      });


    // ==========================================
    // NORMALIZAR IMÁGENES
    // ==========================================

    return odontologos.map(
      odontologo => {


        if (
          odontologo.perfil
        ) {

          this.normalizarPerfil(
            odontologo.perfil
          );

        }


        return odontologo;

      }
    );

  }


  // ==========================================
  // OBTENER ODONTÓLOGO POR ID
  // ==========================================

  static async obtenerOdontologoPorId(
    id
  ) {


    const odontologo =
      await Odontologo.findByPk(

        id,

        {

          include: [

            // ==========================================
            // USUARIO
            // ==========================================

            {

              association:
                "usuario",

              attributes: {
                exclude: [
                  "password"
                ]
              }

            },


            // ==========================================
            // PERFIL
            // ==========================================

            {

              association:
                "perfil"

            }

          ]

        }

      );


    // ==========================================
    // VALIDAR EXISTENCIA
    // ==========================================

    if (!odontologo) {

      throw new AppError(
        "Odontólogo no encontrado",
        404
      );

    }


    // ==========================================
    // NORMALIZAR IMAGEN
    // ==========================================

    if (
      odontologo.perfil
    ) {

      this.normalizarPerfil(
        odontologo.perfil
      );

    }


    return odontologo;

  }


  // ==========================================
  // ACTUALIZAR ODONTÓLOGO
  // ==========================================

  static async actualizarOdontologo(
    id,
    datos,
    archivo
  ) {


    const transaction =
      await sequelize.transaction();


    let imagenAnterior =
      null;


    try {


      // ==========================================
      // BUSCAR ODONTÓLOGO + PERFIL
      // ==========================================

      const odontologo =
        await Odontologo.findByPk(

          id,

          {

            include: [

              {

                association:
                  "perfil"

              }

            ],

            transaction

          }

        );


      if (!odontologo) {

        throw new AppError(
          "Odontólogo no encontrado",
          404
        );

      }


      // ==========================================
      // VALIDACIONES
      // ==========================================

      this.validarFormularioOdontologo(

        datos,

        {
          esActualizacion:
            true
        }

      );


      let usuarioActualizado =
        null;


      // ==========================================
      // ACTUALIZAR USUARIO
      // ==========================================

      if (

        odontologo.id_usuario &&

        (

          datos.email ||
          datos.password ||
          datos.avatar ||
          datos.activo !== undefined

        )

      ) {


        usuarioActualizado =
          await UsuarioService.actualizarUsuario(

            odontologo.id_usuario,

            {

              email:
                datos.email,

              ...(datos.password
                ? { password: datos.password }
                : {}),

              avatar:
                datos.avatar,

              activo:
                datos.activo

            },

            {
              transaction
            }

          );

      }


      // ==========================================
      // ACTUALIZAR ODONTÓLOGO
      // ==========================================

      await odontologo.update(

        {

          nombre:
            datos.nombre ??
            odontologo.nombre,

          apellido:
            datos.apellido ??
            odontologo.apellido,

          cedula:
            datos.cedula ??
            odontologo.cedula,

          celular:
            datos.celular ??
            odontologo.celular,

          numero_licencia:
            datos.numero_licencia ??
            odontologo.numero_licencia,

          id_consultorio:
            datos.id_consultorio ??
            odontologo.id_consultorio

        },

        {
          transaction
        }

      );


      // ==========================================
      // ACTUALIZAR PERFIL
      // ==========================================

      let perfilActualizado =
        odontologo.perfil;


      // ==========================================
      // SI NO EXISTE PERFIL
      // ==========================================

      if (!odontologo.perfil) {


        perfilActualizado =
          await PerfilOdontologo.create(

            {

              id_odontologo:
                odontologo.id,

              titulo_profesional:
                datos.titulo_profesional,

              universidad:
                datos.universidad ||
                null,

              especialidad:
                datos.especialidad ||
                null,

              fecha_inicio_ejercicio:
                datos.fecha_inicio_ejercicio ||
                null,

              img:
                archivo
                  ? `/uploads/perfiles_odontologos/${archivo.filename}`
                  : undefined

            },

            {
              transaction
            }

          );


      } else {


        // ==========================================
        // GUARDAR IMAGEN ANTERIOR
        // ==========================================

        imagenAnterior =
          odontologo.perfil.img;


        // ==========================================
        // CONSTRUIR NUEVA IMAGEN
        // ==========================================

        const nuevaImagen =
          archivo

            ? `/uploads/perfiles_odontologos/${archivo.filename}`

            : odontologo.perfil.img;


        // ==========================================
        // ACTUALIZAR PERFIL
        // ==========================================

        await odontologo.perfil.update(

          {

            titulo_profesional:
              datos.titulo_profesional ??
              odontologo.perfil.titulo_profesional,

            universidad:
              datos.universidad ??
              odontologo.perfil.universidad,

            especialidad:
              datos.especialidad ??
              odontologo.perfil.especialidad,

            fecha_inicio_ejercicio:
              datos.fecha_inicio_ejercicio ??
              odontologo.perfil.fecha_inicio_ejercicio,

            img:
              nuevaImagen

          },

          {
            transaction
          }

        );

      }


      // ==========================================
      // CONFIRMAR TRANSACCIÓN
      // ==========================================

      await transaction.commit();


      // ==========================================
      // ELIMINAR IMAGEN ANTERIOR
      // ==========================================

      if (
        archivo &&
        imagenAnterior
      ) {

        this.eliminarImagenFisica(
          imagenAnterior
        );

      }


      // ==========================================
      // NORMALIZAR PERFIL
      // ==========================================

      this.normalizarPerfil(
        perfilActualizado
      );


      // ==========================================
      // RESPUESTA
      // ==========================================

      return {

        usuario:
          usuarioActualizado,

        odontologo:
          odontologo,

        perfil:
          perfilActualizado

      };


    } catch (error) {


      // ==========================================
      // ROLLBACK
      // ==========================================

      await transaction.rollback();


      // ==========================================
      // ELIMINAR IMAGEN NUEVA
      // ==========================================

      if (archivo) {

        this.eliminarImagenFisica(
          archivo.filename
        );

      }


      throw error;

    }

  }


  // ==========================================
  // ELIMINAR ODONTÓLOGO
  // ==========================================

  static async eliminarOdontologo(
    id,
    force = false
  ) {


    const transaction =
      await sequelize.transaction();


    let imagenPerfil =
      null;


    try {


      // ==========================================
      // BUSCAR ODONTÓLOGO + PERFIL
      // ==========================================

      const odontologo =
        await Odontologo.findByPk(

          id,

          {

            include: [

              {

                association:
                  "perfil"

              }

            ],

            transaction

          }

        );


      if (!odontologo) {

        throw new AppError(
          "Odontólogo no encontrado",
          404
        );

      }


      // ==========================================
      // GUARDAR IMAGEN DEL PERFIL
      // ==========================================

      if (
        odontologo.perfil
      ) {

        imagenPerfil =
          odontologo.perfil.img;

      }


      // ==========================================
      // VALIDAR CITAS
      // ==========================================

      const totalCitas =
        await odontologo.countCitas({

          transaction

        });


      if (
        totalCitas > 0 &&
        !force
      ) {


        await transaction.rollback();


        return {

          requiereConfirmacion:
            true,

          totalCitas,

          message:
            `El odontólogo tiene ${totalCitas} citas asignadas. ¿Deseas eliminarlo?`

        };

      }


      // ==========================================
      // ELIMINAR ODONTÓLOGO
      // ==========================================
      //
      // Debido a onDelete: CASCADE,
      // el perfil también se elimina
      // de la base de datos.
      //
      // ==========================================

      await odontologo.destroy({

        transaction

      });


      // ==========================================
      // ELIMINAR USUARIO
      // ==========================================

      if (
        odontologo.id_usuario
      ) {

        await UsuarioService.eliminarUsuario(

          odontologo.id_usuario,

          {
            transaction
          }

        );

      }


      // ==========================================
      // CONFIRMAR TRANSACCIÓN
      // ==========================================

      await transaction.commit();


      // ==========================================
      // ELIMINAR IMAGEN FÍSICA
      // ==========================================

      if (
        imagenPerfil
      ) {

        this.eliminarImagenFisica(
          imagenPerfil
        );

      }


      // ==========================================
      // RESPUESTA
      // ==========================================

      return {

        eliminado:
          true

      };


    } catch (error) {


      // ==========================================
      // ROLLBACK
      // ==========================================

      await transaction.rollback();


      throw error;

    }

  }

}


export default OdontologoService;