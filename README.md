# Colaborador · frontend

Portal Angular para consultar la información laboral del colaborador.

## Ejecutar

Requiere Node.js compatible con Angular 22. Ejecuta `npm install` y `npm start` para usar los datos de demostración sin backend. Para conectarte al backend local, inicia primero su API en el puerto 8080 y ejecuta `npm run start:backend`. El proxy de desarrollo dirige `/api` a `http://localhost:8080`.

Ejecuta `npm run build` para crear la versión de producción. Este build utiliza `environment.production.ts`: desactiva los mocks y consume `/api` en el mismo origen. En el despliegue, configura el servidor para dirigir ese prefijo al backend.

## Módulos

- Inicio del colaborador: `/employee-homes`.
- Horas extras: `/overtime-records`.
- Mi perfil: `/employee-profiles`.
- Beneficios y saldos: `/employee-benefits`.
- Acceso al portal: `/login`, gestionado por la sesión de la aplicación.

## Conexión con las otras capas

El frontend se sirve localmente en `http://localhost:4200` y se comunica exclusivamente con el backend mediante HTTP bajo `/api`; no accede a Firestore. El backend escucha en el puerto 8080 y debe permitir el origen `http://localhost:4200` mediante `FRONT_URL`. El backend utiliza el proyecto Firestore `demo-app` y, en desarrollo, su emulador en `127.0.0.1:8085`; consulta el README de la base de datos para iniciarlo y cargar los datos. La sesión utiliza `POST /api/auth/login`, `GET /api/auth/me` y `POST /api/auth/logout`.
