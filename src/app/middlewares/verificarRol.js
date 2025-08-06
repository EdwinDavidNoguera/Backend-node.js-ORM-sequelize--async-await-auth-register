// Exporta una función que recibe una lista de roles permitidos como argumentos
export default function verificarRol(...rolesPermitidos) {
  // Retorna un middleware para Express
  return (req, res, next) => {
    // Obtiene el rol del usuario desde el objeto de solicitud (req)
    const rolUsuario = req.usuario?.rol;

    // Si no se encuentra un rol en el usuario, se niega el acceso
    if (!rolUsuario) {
      return res.status(403).json({ message: 'No se pudo verificar el rol del usuario' });
    }

    // Verifica si el rol del usuario está dentro de los roles permitidos
    if (!rolesPermitidos.includes(rolUsuario)) {
      return res.status(403).json({ message: 'Acceso denegado: rol no autorizado' });
    }

    // Si todo está bien, pasa al siguiente middleware o controlador
    next();
  };
}
