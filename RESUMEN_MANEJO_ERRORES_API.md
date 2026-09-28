# Resumen de manejo de respuestas y errores de la API para Axios

## 1. Base de la API
La API corre en:

```txt
http://localhost:3500
```

El backend monta todas las rutas desde `src/app/routes/indexRoutes.js`, por lo que el frontend debe usar esas rutas como prefijos.

---

## 2. Estructura general de respuesta
El backend usa un formato consistente para respuestas exitosas y errores. El objetivo es que el frontend pueda manejar todo con una sola lógica.

### Respuesta exitosa
Archivo: `src/app/utils/errors/manajadorRespuestaExitosa.js`

Formato:

```json
{
  "success": true,
  "message": "Mensaje de la operación",
  "data": { ... },
  "errors": false
}
```

#### Significado:
- `success`: true si la operación fue exitosa
- `message`: texto amigable para mostrar al usuario
- `data`: el contenido real devuelto por la API
- `errors`: false en caso exitoso

#### Ejemplo:
```json
{
  "success": true,
  "message": "Paciente registrado correctamente",
  "data": {
    "id": 5,
    "nombre": "Ana"
  },
  "errors": false
}
```

---

### Respuesta de error
Archivo: `src/app/utils/errors/manejadorRespuestaError.js`

Formato base:

```json
{
  "success": false,
  "message": "Error interno del servidor",
  "data": null,
  "errors": true
}
```

También puede venir así:

```json
{
  "success": false,
  "message": "Validación fallida",
  "data": null,
  "errors": {
    "email": "El correo es obligatorio",
    "password": "La contraseña es muy corta"
  }
}
```

#### Significado:
- `success`: false si la operación falló
- `message`: mensaje general para mostrar al usuario
- `data`: null cuando hubo error
- `errors`: puede ser true, false o un objeto con detalles

---

## 3. Manejo de errores por tipo
Archivo: `src/app/utils/errors/manejadorErrorDB.js`

Este middleware convierte errores de base de datos de Sequelize a una respuesta uniforme.

### Casos comunes:
- `SequelizeValidationError` => 400
- `SequelizeUniqueConstraintError` => 409
- `SequelizeConnectionError` => 503
- `SequelizeDatabaseError` => 500

### Ejemplo de error de validación:
```json
{
  "success": false,
  "message": "Error de validación",
  "data": null,
  "errors": {
    "email": "El correo ya existe"
  }
}
```

### Ejemplo de conflicto:
```json
{
  "success": false,
  "message": "Conflicto: valor ya registrado",
  "data": null,
  "errors": {
    "email": "El correo ya está registrado"
  }
}
```

---

## 4. Clase personalizada de errores
Archivo: `src/app/utils/errors/appError.js`

Se usa esta clase para lanzar errores controlados:

```js
throw new AppError("El email ya está registrado", 409, { email: "Ya existe" });
```

Eso hace que el backend genere una respuesta consistente en vez de dejar errores sueltos.

### Importante:
Todos los errores importantes deben lanzarse con `AppError` para que el frontend reciba un formato entendible y uniforme.

---

## 5. Captura de errores async
Archivo: `src/app/utils/errors/catchAsync.js`

Se usa esta función para evitar errores sin manejo en controladores async:

```js
const catchAsync = (controller) => {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next))
      .catch(next);
  };
};
```

Esto hace que cualquier error async pase al middleware global y sea transformado en la respuesta correcta.

---

## 6. Resumen del formato de respuesta

### Si la petición funciona:
```json
{
  "success": true,
  "message": "Operación realizada correctamente",
  "data": {},
  "errors": false
}
```

### Si la petición falla:
```json
{
  "success": false,
  "message": "Ocurrió un error",
  "data": null,
  "errors": {}
}
```

---

## 7. Recomendación para el frontend con Axios
El frontend debe manejar la respuesta como:

```js
try {
  const response = await axios.get('http://localhost:3500/pacientes', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.data.success) {
    console.log(response.data.data);
  } else {
    console.error(response.data.message);
    console.error(response.data.errors);
  }
} catch (error) {
  const payload = error.response?.data;

  if (payload) {
    console.error(payload.message || 'Error desconocido');
    console.error(payload.errors || {});
  }
}
```

### Se recomienda usar interceptors en Axios:
```js
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;

    if (payload?.success === false) {
      console.error(payload.message);
      return Promise.reject(payload);
    }

    return Promise.reject(error);
  }
);
```

Esto permite centralizar el manejo de errores en una sola parte del frontend.

---

## 8. Rutas principales del backend

### Login
- `POST /login`

### Usuarios
- `GET /usuarios`
- `POST /usuarios`
- `GET /usuarios/:id`
- `PUT /usuarios/:id`
- `DELETE /usuarios/:id`

### Pacientes
- `GET /pacientes`
- `POST /pacientes`
- `GET /pacientes/:id`
- `PUT /pacientes/:id`
- `DELETE /pacientes/:id`
- `POST /pacientes/visitante`

### Odontólogos
- `GET /odontologos`
- `POST /odontologos`
- `GET /odontologos/:id`
- `PUT /odontologos/:id`
- `DELETE /odontologos/:id`

### Servicios
- `GET /servicios`
- `POST /servicios`
- `GET /servicios/:id`
- `PUT /servicios/:id`
- `DELETE /servicios/:id`
- `GET /servicios/:id/odontologos`

### Citas
- `GET /citas/disponibilidad`
- `GET /citas/verificar-email`
- `POST /citas`
- `GET /citas`
- `GET /citas/odontologo/:id_odontologo`
- `GET /citas/paciente/:id_paciente`
- `GET /citas/:id`
- `PUT /citas/:id`
- `PUT /citas/:id/cancelar`

### Historial
- `POST /historial`
- `GET /historial/paciente/:id_paciente`
- `GET /historial/paciente/:id_paciente/pdf`
- `GET /historial/:id`
- `PUT /historial/:id`

---

## 9. Recomendación importante para el desarrollador frontend
El desarrollador frontend debe asumir que todas las respuestas del backend seguirán este patrón:

- Si `success === true`, leer `data`
- Si `success === false`, usar `message` para mostrar error y `errors` para detalles adicionales
- Las respuestas no deben interpretarse como si fueran estructuradas de forma distinta por endpoint

Esto hace que el cliente Axios sea mucho más simple y consistente.

---

## 10. Mensaje clave para el backend
El desarrollador que entrega el backend debe mantener siempre este contrato en todos los endpoints:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {},
  "errors": false
}
```

y para errores:

```json
{
  "success": false,
  "message": "Error",
  "data": null,
  "errors": {}
}
```

Esto permite construir un cliente Axios robusto y una interfaz uniforme.

---

## 11. Conclusión
El backend ya tiene una convención clara de manejo de respuestas:

- respuestas exitosas con `success: true`
- errores con `success: false`
- mensajes legibles para el usuario
- detalles en `errors`
- captura centralizada de fallos con `catchAsync` y middlewares

Esto es suficiente para construir un cliente Axios confiable en el frontend sin suposiciones ni inconsistencias.

---

## 12. Nota para el desarrollador de frontend
El cliente Axios debe asumir siempre este formato de respuesta del backend y no depender de respuestas diferentes por endpoint. Esa regla hace que toda la app tenga un comportamiento uniforme y más fácil de mantener.
