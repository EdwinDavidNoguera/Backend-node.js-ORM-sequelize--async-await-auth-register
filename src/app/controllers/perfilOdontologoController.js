import PerfilOdontologoService from "../services/perfilOdontologoService.js";
import { catchAsync } from "../utils/index.js";
import enviarRespuestaExitosa from "../utils/errors/manajadorRespuestaExitosa.js";

class PerfilOdontologoController {

  static crearPerfil = catchAsync(async (req, res) => {
    const nuevoPerfil = await PerfilOdontologoService.crearPerfil(req.body);

    enviarRespuestaExitosa(
      res,
      201,
      "Perfil de odontólogo creado correctamente",
      nuevoPerfil
    );
  });

  static obtenerPerfilPorOdontologo = catchAsync(async (req, res) => {
    const { id_odontologo } = req.params;
    const perfil = await PerfilOdontologoService.obtenerPerfilPorOdontologo(id_odontologo);

    enviarRespuestaExitosa(
      res,
      200,
      "Perfil obtenido correctamente",
      perfil
    );
  });

  static actualizarPerfil = catchAsync(async (req, res) => {
    const { id } = req.params;
    const perfilActualizado = await PerfilOdontologoService.actualizarPerfil(id, req.body);

    enviarRespuestaExitosa(
      res,
      200,
      "Perfil actualizado correctamente",
      perfilActualizado
    );
  });

  static eliminarPerfil = catchAsync(async (req, res) => {
    const { id } = req.params;
    await PerfilOdontologoService.eliminarPerfil(id);

    enviarRespuestaExitosa(
      res,
      200,
      "Perfil de odontólogo eliminado correctamente"
    );
  });

}

export default PerfilOdontologoController;