import OdontologoService from "../services/odontologoServices.js";
import { catchAsync } from "../utils/index.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";

class OdontologoController {

  /**
   * Crear odontólogo junto con:
   * - Usuario
   * - Odontólogo
   * - Perfil
   * - Imagen del perfil
   */
  crearOdontologo = catchAsync(async (req, res) => {

    const resultado =
      await OdontologoService.crearOdontologo(
        req.body,
        req.file
      );


    if (resultado.usuario) {

      resultado.usuario =
        resultado.usuario.toJSON
          ? resultado.usuario.toJSON()
          : resultado.usuario;

      delete resultado.usuario.password;
    }


    enviarRespuestaExitosa(
      res,
      201,
      "Odontólogo y perfil creados correctamente",
      resultado
    );
  });


  /**
   * Obtener todos los odontólogos
   */
  obtenerOdontologos = catchAsync(async (req, res) => {

    const odontologos =
      await OdontologoService.obtenerOdontologos();


    enviarRespuestaExitosa(
      res,
      200,
      "Listado de odontólogos obtenido con éxito",
      odontologos
    );
  });


  /**
   * Obtener odontólogo por ID
   */
  obtenerOdontologoPorId = catchAsync(async (req, res) => {

    const { id } = req.params;


    const odontologo =
      await OdontologoService.obtenerOdontologoPorId(
        id
      );


    enviarRespuestaExitosa(
      res,
      200,
      "Odontólogo encontrado con éxito",
      odontologo
    );
  });


  /**
  * Actualiza el odontólogo, su usuario, perfil e imagen.
   */
  actualizarOdontologo = catchAsync(async (req, res) => {

    const { id } = req.params;


    const resultado =
      await OdontologoService.actualizarOdontologo(
        id,
        req.body,
        req.file
      );


    if (resultado.usuario) {

      resultado.usuario =
        typeof resultado.usuario.toJSON === "function"
          ? resultado.usuario.toJSON()
          : resultado.usuario;

      delete resultado.usuario.password;
    }


    enviarRespuestaExitosa(
      res,
      200,
      "Odontólogo y perfil actualizados correctamente",
      resultado
    );
  });


  /**
   * Eliminar odontólogo.
   */
  eliminarOdontologo = catchAsync(async (req, res) => {

    const { id } = req.params;


    const force =
      req.query.force === "true";


    const resultado =
      await OdontologoService.eliminarOdontologo(
        id,
        force
      );


    if (
      resultado.requiereConfirmacion
    ) {

      return enviarRespuestaExitosa(
        res,
        200,
        resultado.message,
        {
          requiereConfirmacion: true,
          totalCitas: resultado.totalCitas
        }
      );
    }


    enviarRespuestaExitosa(
      res,
      200,
      "Odontólogo, perfil, imagen y credenciales eliminados correctamente"
    );
  });

}


export default new OdontologoController();