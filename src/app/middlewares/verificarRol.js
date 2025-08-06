export default function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    const rolUsuario = req.usuario?.rol;

    if (!rolUsuario) {
      return res.status(403).json({ message: 'No se pudo verificar el rol del usuario' });
    }

    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ message: 'Acceso denegado: rol no autorizado' });
    }

    next(); // Todo bien, pasa a la siguiente función
  };
}
