# Informe de funcionalidades del backend

## Propósito

Este backend proporciona una API para un sistema de gestión de citas odontológicas. El frontend puede utilizarlo para construir el panel administrativo de la clínica y las interfaces de pacientes y odontólogos.

## Configuración general

- URL local predeterminada: `http://localhost:3500`
- Las rutas se montan desde `src/app/routes/indexRoutes.js`.
- La autenticación utiliza JWT.
- Las rutas protegidas requieren el encabezado:

```http
Authorization: Bearer TOKEN
```

La mayoría de las respuestas utiliza esta estructura:

```json
{
  "success": true,
  "message": "Mensaje de la operación",
  "data": {},
  "errors": false
}
```

## Roles disponibles

- `ADMIN`: administra los recursos de la clínica.
- `ODONTOLOGO`: gestiona sus citas, horarios e historias clínicas autorizadas.
- `PACIENTE`: consulta y gestiona su propia información y sus citas.

## 1. Autenticación

| Método | Endpoint | Acceso | Función |
|---|---|---|---|
| POST | `/login` | Público | Iniciar sesión |
| POST | `/usuarios/recuperar-password` | Público | Solicitar recuperación de contraseña |
| POST | `/usuarios/restablecer-password/:token` | Público | Restablecer la contraseña con un token |

El inicio de sesión devuelve el token JWT, el ID, el rol, el correo y el avatar del usuario.

El frontend debe conservar el token para enviarlo en las solicitudes protegidas. Las contraseñas y los tokens de recuperación nunca deben mostrarse en la interfaz.

## 2. Gestión de usuarios

Estas operaciones están disponibles para el administrador.

| Método | Endpoint | Acceso |
|---|---|---|
| GET | `/usuarios` | ADMIN |
| POST | `/usuarios` | ADMIN |
| GET | `/usuarios/:id` | ADMIN |
| PUT | `/usuarios/:id` | ADMIN |
| DELETE | `/usuarios/:id` | ADMIN |

Permite:

- Consultar usuarios registrados.
- Crear cuentas de acceso.
- Actualizar correo, contraseña, avatar, estado y rol.
- Eliminar usuarios.

## 3. Gestión de pacientes

| Método | Endpoint | Acceso |
|---|---|---|
| GET | `/pacientes` | ADMIN, ODONTOLOGO |
| POST | `/pacientes` | Público |
| POST | `/pacientes/visitante` | Público |
| GET | `/pacientes/:id` | ADMIN, ODONTOLOGO |
| PUT | `/pacientes/:id` | ADMIN, ODONTOLOGO |
| DELETE | `/pacientes/:id` | ADMIN, ODONTOLOGO |

Datos principales del paciente:

- `nombre`
- `apellido`
- `cedula`
- `celular`
- `email`
- `genero`
- `fecha_nacimiento`
- `direccion`
- `id_usuario`

El registro de visitante permite crear un paciente sin cuenta de usuario para realizar una cita.

El administrador puede consultar, registrar, actualizar y eliminar pacientes desde su panel.

## 4. Gestión de odontólogos

| Método | Endpoint | Acceso |
|---|---|---|
| GET | `/odontologos` | Público |
| POST | `/odontologos` | ADMIN |
| GET | `/odontologos/:id` | Público |
| PUT | `/odontologos/:id` | ADMIN, ODONTOLOGO |
| DELETE | `/odontologos/:id` | ADMIN |

Datos principales:

- Nombre y apellido.
- Cédula y celular.
- Correo y cuenta asociada.
- Número de licencia profesional.
- Consultorio asignado.
- Título profesional.
- Universidad.
- Especialidad.
- Fecha de inicio de ejercicio.
- Imagen de perfil.

La creación y actualización pueden recibir una imagen mediante `multipart/form-data`, utilizando el campo `img`.

Al eliminar un odontólogo, el backend puede solicitar confirmación si existen citas relacionadas. La respuesta puede incluir:

```json
{
  "requiereConfirmacion": true,
  "totalCitas": 3
}
```

Para confirmar la eliminación se utiliza el parámetro `?force=true`.

## 5. Gestión de servicios

| Método | Endpoint | Acceso |
|---|---|---|
| GET | `/servicios` | Público |
| POST | `/servicios` | ADMIN |
| GET | `/servicios/:id` | ADMIN, ODONTOLOGO, PACIENTE |
| PUT | `/servicios/:id` | ADMIN |
| DELETE | `/servicios/:id` | ADMIN |
| GET | `/servicios/:id/odontologos` | Público |

Datos de un servicio:

- `nombre`
- `descripcion`
- `duracion_minutos`
- `costo`
- `img`
- `activo`

La eliminación de un servicio es lógica. El registro permanece en la base de datos, pero deja de estar disponible para nuevas citas.

El backend también contiene lógica para asignar servicios a odontólogos mediante `id_odontologo` e `ids_servicios`. Debe verificarse que esta operación esté registrada en las rutas activas antes de construir una pantalla específica para ella.

## 6. Gestión de consultorios

| Método | Endpoint | Acceso |
|---|---|---|
| GET | `/consultorio` | ADMIN, ODONTOLOGO, PACIENTE |
| POST | `/consultorio` | ADMIN |
| GET | `/consultorio/:id` | ADMIN, ODONTOLOGO, PACIENTE |
| PUT | `/consultorio/:id` | ADMIN |
| DELETE | `/consultorio/:id` | ADMIN |

Datos principales:

- `nombre`
- `direccion`
- `ciudad`
- `activo`

La consulta general permite utilizar `?todos=true` para incluir consultorios inactivos.

## 7. Horarios de odontólogos

| Método | Endpoint | Acceso |
|---|---|---|
| POST | `/horarioOdontologo` | ADMIN, ODONTOLOGO |
| GET | `/horarioOdontologo/odontologo/:id_odontologo` | Público |
| DELETE | `/horarioOdontologo/:id` | ADMIN, ODONTOLOGO |

Datos del horario:

- `id_odontologo`
- `dia_semana`
- `hora_inicio`
- `hora_fin`

Días permitidos:

- `LUNES`
- `MARTES`
- `MIERCOLES`
- `JUEVES`
- `VIERNES`
- `SABADO`

Los horarios se utilizan para calcular la disponibilidad de citas.

## 8. Gestión de citas

### Consultas y operaciones públicas

| Método | Endpoint | Función |
|---|---|---|
| GET | `/citas/disponibilidad` | Consultar horarios disponibles |
| GET | `/citas/verificar-email` | Verificar si un correo pertenece a un paciente |
| POST | `/citas` | Crear una cita como invitado o usuario autenticado |

### Operaciones protegidas

| Método | Endpoint | Acceso |
|---|---|---|
| GET | `/citas` | ADMIN |
| GET | `/citas/odontologo/:id_odontologo` | ADMIN, ODONTOLOGO |
| GET | `/citas/paciente/:id_paciente` | ADMIN, ODONTOLOGO, PACIENTE |
| GET | `/citas/:id` | ADMIN, ODONTOLOGO, PACIENTE |
| PUT | `/citas/:id` | ADMIN, ODONTOLOGO, PACIENTE |
| PUT | `/citas/:id/cancelar` | ADMIN, ODONTOLOGO, PACIENTE |

Datos principales de una cita:

- `id_paciente`
- `id_odontologo`
- `id_servicio`
- `fecha`
- `hora`
- `hora_fin`
- `estado`

Estados disponibles:

- `PROGRAMADA`
- `ATENDIDA`
- `CANCELADA`

El sistema:

- Evita agendar citas en el pasado.
- Calcula `hora_fin` según la duración del servicio.
- Comprueba que el odontólogo ofrezca el servicio.
- Verifica que la cita esté dentro del horario laboral.
- Evita cruces entre citas existentes.
- Puede asignar automáticamente un odontólogo disponible.
- Envía un correo de confirmación cuando existe un correo válido.

### Filtros para consultar citas

El endpoint `GET /citas` acepta los siguientes parámetros:

- `id_paciente`
- `id_odontologo`
- `id_servicio`
- `estado`
- `fecha`
- `fecha_desde`
- `fecha_hasta`

Ejemplo:

```http
GET /citas?fecha_desde=2026-08-01&fecha_hasta=2026-08-31&estado=PROGRAMADA
```

## 9. Historias clínicas

| Método | Endpoint | Acceso |
|---|---|---|
| POST | `/historial` | ADMIN, ODONTOLOGO |
| GET | `/historial/paciente/:id_paciente` | ADMIN, ODONTOLOGO, PACIENTE |
| GET | `/historial/paciente/:id_paciente/pdf` | ADMIN, ODONTOLOGO, PACIENTE |
| GET | `/historial/:id` | ADMIN, ODONTOLOGO |
| PUT | `/historial/:id` | ADMIN, ODONTOLOGO |

Datos clínicos:

- `id_cita`
- `motivo_consulta`
- `diagnostico`
- `tratamiento_realizado`
- `medicamentos_recetados`
- `observaciones`

Los campos obligatorios para crear una historia son:

- `id_cita`
- `diagnostico`
- `tratamiento_realizado`

Al crear una historia clínica, la cita relacionada cambia automáticamente a estado `ATENDIDA`.

El endpoint PDF devuelve un archivo directamente y no utiliza la estructura JSON estándar.

## 10. Propuesta de módulos para el panel administrador

El frontend administrador puede incluir las siguientes pantallas:

1. Inicio de sesión.
2. Dashboard general.
3. Calendario y listado de citas.
4. Crear, reprogramar, cancelar y consultar citas.
5. Filtros por fecha, estado, paciente, odontólogo y servicio.
6. Gestión de pacientes.
7. Gestión de odontólogos y perfiles profesionales.
8. Asignación de servicios a odontólogos.
9. Gestión de servicios e imágenes.
10. Gestión de consultorios.
11. Configuración de horarios.
12. Consulta y descarga de historias clínicas.
13. Administración de usuarios, roles y estados.

## 11. Respuestas y errores que debe manejar el frontend

El frontend debe contemplar los siguientes códigos:

- `200`: operación exitosa.
- `201`: registro creado.
- `400`: datos inválidos o reglas de negocio incumplidas.
- `401`: falta autenticación.
- `403`: rol sin permisos.
- `404`: recurso no encontrado.
- `409`: conflicto, por ejemplo una cita cruzada o un correo duplicado.
- `500`: error interno del servidor.
- `503`: servicio de base de datos no disponible.

## 12. Observaciones técnicas

- El endpoint de login utiliza una respuesta diferente a la estructura estándar.
- Las imágenes deben enviarse con `multipart/form-data`.
- Los servicios inactivos no deben aparecer como opciones para nuevas citas.
- El administrador puede consultar las citas con información relacionada del paciente, odontólogo y servicio.
- No existe actualmente un endpoint específico para estadísticas del dashboard, como citas del día, pacientes registrados o ingresos.
- La asignación de servicios a odontólogos tiene lógica en el controlador, pero no aparece registrada en las rutas activas revisadas.
- El frontend debe ocultar contraseñas, tokens de recuperación y cualquier dato sensible.
