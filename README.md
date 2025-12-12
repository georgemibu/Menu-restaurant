# 🍽️ Menu Restaurant

Sistema de gestión de menús digitales para restaurantes. Permite a los restaurantes crear y personalizar sus menús digitales con códigos QR.

## Características

- ✅ Gestión de productos (CRUD completo)
- ✅ Personalización de menú (colores, logo, información del restaurante)
- ✅ Generación de códigos QR para menús
- ✅ Panel de administración para gestión de usuarios
- ✅ Sistema de suscripciones
- ✅ Menú público responsive

## Tecnologías

- **Backend:** Node.js, Express.js
- **Base de Datos:** SQLite (desarrollo) / PostgreSQL (producción)
- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Autenticación:** JWT
- **Uploads:** Multer

## Instalación Local

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   cd backend
   npm install
   ```

3. Crea un archivo `.env` en la carpeta `backend`:
   ```
   SECRET_KEY=tu_clave_secreta_aqui
   PORT=3001
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```

5. Abre tu navegador en: `http://localhost:3001/admin.html`

## Despliegue

Consulta el archivo [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas de despliegue en servicios gratuitos como Render, Railway o Fly.io.

## Usuario Administrador por Defecto

Para crear un usuario administrador, ejecuta:

```bash
cd backend
node scripts/createAdminUser.js
```

O crea uno manualmente desde el panel de administración (si ya tienes un admin).

## Estructura del Proyecto

```
Menu-restaurant/
├── backend/
│   ├── models/          # Modelos de Sequelize
│   ├── routes/          # Rutas de la API
│   ├── middlewares/     # Middlewares de autenticación
│   ├── public/          # Archivos estáticos (HTML, CSS, JS)
│   ├── uploads/          # Imágenes subidas
│   └── scripts/         # Scripts de utilidad
└── README.md
```

## Licencia

ISC

