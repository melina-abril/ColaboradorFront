# Colaborador · frontend

Portal del colaborador desarrollado con Angular 22.

## Ejecutar

Se requieren Node.js y npm. Ejecuta `npm install` y `npm start` para abrir la aplicación en `http://localhost:4200` con los datos de demostración de la configuración fija de desarrollo. La contraseña de demostración es `Demo1234!`.

Para usar el backend local, arráncalo en el puerto `8080` y ejecuta `npm run start:backend`. El proxy fijo envía las solicitudes `/api` al backend; el origen `http://localhost:4200` debe estar permitido mediante `FRONT_URL` en su configuración. La sesión utiliza `POST /api/auth/login`, `GET /api/auth/me` y `POST /api/auth/logout`. Los módulos consumen únicamente los endpoints `/api/employee-homes/summary`, `/api/employee-profiles/me` y sus recursos de contrato y formación, y `/api/employee-benefits`.

`npm run build` genera la versión de producción. Su configuración fija desactiva los mocks y llama a la API bajo `/api` en el mismo origen. El frontend no accede directamente a Firestore: el backend utiliza `FIREBASE_PROJECT_ID=demo-app` y `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` para conectarse al emulador de la base.

## Módulos

- Inicio del colaborador (`/employee-homes`), pantalla principal.
- Mi perfil (`/employee-profiles`), incluidos contrato y formación.
- Beneficios y saldos (`/employee-benefits`).
- Acceso al portal (`/login`), gestionado por las rutas de sesión existentes.
