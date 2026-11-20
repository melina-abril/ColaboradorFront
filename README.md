# Colaborador · frontend

Estructura inicial del Portal del colaborador en Angular 22. Aún no hay módulos funcionales; la ruta inicial muestra una bienvenida y la sesión cuenta con una pantalla de acceso.

## Desarrollo

Necesitas Node.js y npm. Ejecuta `npm install` y `npm start` para abrir la aplicación en `http://localhost:4200` con la sesión de demostración. Puedes ingresar con cualquier correo y la contraseña `Demo1234!`.

Para usar el backend local, levántalo en el puerto `8080` y ejecuta `npm run start:backend`. El proxy envía las solicitudes con prefijo `/api` al backend. La sesión utiliza `POST /api/auth/login`, `POST /api/auth/logout` y `GET /api/auth/me`. El backend debe permitir `http://localhost:4200` mediante `FRONT_URL`.

`npm run build` genera la versión de producción con `environment.production.ts`: desactiva los mocks y utiliza `/api` en el mismo origen. Configura el servidor de despliegue para dirigir ese prefijo al backend.

## Módulos

Todavía no hay módulos funcionales. Las rutas y la navegación se ampliarán al incorporarlos.

## Otras capas

El backend está en un repositorio separado y escucha en el puerto `8080`. Su base Cloud Firestore usa el proyecto `demo-app` y, en desarrollo, un emulador en `127.0.0.1:8085`. El frontend no se conecta directamente a Firestore: todas sus solicitudes pasan por el backend.
