# Colaborador

Portal Angular del colaborador.

## Desarrollo

Requiere Node.js y npm. Ejecuta `npm install` y luego `npm start` para usar el portal con datos de demostración, sin levantar el backend. Para conectarlo al backend local, inicia ese servicio en el puerto `8080` y ejecuta `npm run start:backend`. El proxy de desarrollo envía las solicitudes bajo `/api` a ese puerto.

Ejecuta `npm run build` para generar la versión de producción. Este build usa `environment.production.ts`: desactiva los mocks y llama a `/api` en el mismo origen en el que se despliega el frontend.

## Módulos

- **Inicio del colaborador** (`/employee-homes`): resumen personal de saldos y novedades.
- **Acceso al portal** (`/login`): inicio de sesión; la ruta y la sesión pertenecen a la infraestructura compartida.

## Conexión con las otras capas

El backend vive en `https://github.com/melina-abril/ColaboradorBack` y escucha en `8080`. El frontend consume `GET /api/employee-homes/summary` y las rutas de sesión `POST /api/auth/login`, `POST /api/auth/logout` y `GET /api/auth/me`. Para desarrollo conectado, el backend debe admitir el origen `http://localhost:4200` mediante su variable `FRONT_URL`. El frontend no se conecta directamente a Firestore; el backend utiliza `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` para acceder al emulador de la base de datos.
