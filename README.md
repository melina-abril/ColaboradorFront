# Colaborador · frontend

Portal del colaborador desarrollado con Angular 22.

## Desarrollo

Requiere Node.js y npm. Ejecuta `npm install` y `npm start` para abrir la aplicación con datos de demostración en `http://localhost:4200`. La contraseña del modo de demostración es `Demo1234!`.

Para conectarla al backend, inicia primero su API en `http://localhost:8080` y ejecuta `npm run start:backend`. El proxy de desarrollo dirige las solicitudes `/api` a ese puerto. El backend debe permitir el origen `http://localhost:4200` mediante `FRONT_URL`. La sesión utiliza `POST /api/auth/login`, `GET /api/auth/me` y `POST /api/auth/logout`; las pantallas consumen únicamente los endpoints de sus módulos. El frontend no se conecta directamente a Firestore: el backend utiliza `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` en desarrollo.

Ejecuta `npm run build` para generar la versión de producción. Esa versión siempre usa el backend, con la API bajo `/api` en el mismo origen; configura el servidor de despliegue para dirigir ese prefijo al backend.

## Módulos

- Inicio del colaborador: `/employee-homes`.
- Calendario personal y comunicados: `/employee-homes-calendar`.
- Horas extras: `/overtime-records`.
- Mi perfil: `/employee-profiles`.
- Beneficios y saldos: `/employee-benefits`.
- Acceso al portal: `/login`, gestionado por la sesión de la aplicación.
