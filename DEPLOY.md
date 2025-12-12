# Guía de Despliegue - Menu Restaurant

Esta guía te ayudará a subir tu proyecto a la web de forma gratuita usando **Render**.

## Opción 1: Render (Recomendado - Gratis)

### Paso 1: Preparar el proyecto

1. Asegúrate de tener una cuenta en GitHub (gratis)
2. Crea un repositorio en GitHub
3. Sube tu código al repositorio

### Paso 2: Crear cuenta en Render

1. Ve a [render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub (gratis)
3. Conecta tu cuenta de GitHub

### Paso 3: Desplegar en Render

1. En el dashboard de Render, haz clic en "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configura el servicio:
   - **Name:** `menu-restaurant` (o el nombre que prefieras)
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm ci`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** (dejar vacío o poner `/`)
   - **Node Version:** `18.x` o `20.x` (evitar Node 22 por compatibilidad)

4. **Variables de Entorno:**
   - `NODE_ENV` = `production`
   - `PORT` = `3001` (o el puerto que Render asigne automáticamente)
   - `SECRET_KEY` = (genera una clave secreta aleatoria, puedes usar: `openssl rand -base64 32`)

5. Haz clic en "Create Web Service"

### Paso 4: Configurar almacenamiento de archivos

Render tiene almacenamiento efímero, así que las imágenes subidas se perderán al reiniciar. Para solucionarlo:

**Opción A: Usar un servicio de almacenamiento en la nube (recomendado)**
- Cloudinary (gratis hasta 25GB)
- AWS S3 (tiene tier gratuito)
- Google Cloud Storage

**Opción B: Usar disco persistente de Render (requiere plan de pago)**

### Paso 5: Actualizar URLs en el frontend

Después del despliegue, Render te dará una URL como: `https://menu-restaurant.onrender.com`

Necesitas actualizar la URL base en `admin.html`:

```javascript
// Cambiar esta línea en admin.html (línea ~498)
const apiBase = 'https://tu-app.onrender.com/api';
```

## Opción 2: Railway (Alternativa Gratis)

1. Ve a [railway.app](https://railway.app)
2. Regístrate con GitHub
3. Crea un nuevo proyecto
4. Conecta tu repositorio
5. Railway detectará automáticamente Node.js
6. Configura las variables de entorno
7. Railway te dará una URL automáticamente

## Opción 3: Fly.io (Alternativa Gratis)

1. Ve a [fly.io](https://fly.io)
2. Instala el CLI: `curl -L https://fly.io/install.sh | sh`
3. Ejecuta: `fly launch`
4. Sigue las instrucciones

## Notas Importantes

### Base de Datos

Actualmente usas SQLite, que funciona bien en desarrollo pero tiene limitaciones en producción:

- **SQLite en Render:** Funciona pero los datos se pierden al reiniciar (almacenamiento efímero)
- **Recomendación:** Migrar a PostgreSQL (gratis en Render)

### Migración a PostgreSQL (Opcional pero Recomendado)

Si quieres usar PostgreSQL en Render:

1. En Render, crea un nuevo "PostgreSQL" service
2. Obtén la URL de conexión
3. Actualiza `backend/models/index.js` para usar PostgreSQL en producción

### Variables de Entorno

Asegúrate de configurar estas variables en tu servicio de hosting:

- `SECRET_KEY`: Clave secreta para JWT (genera una aleatoria)
- `PORT`: Puerto (generalmente se asigna automáticamente)
- `NODE_ENV`: `production`

### Almacenamiento de Imágenes

Para producción, considera usar:
- **Cloudinary** (gratis hasta 25GB): Fácil de integrar
- **AWS S3**: Tiene tier gratuito
- **Google Cloud Storage**: Tiene tier gratuito

## Solución de Problemas

### Error: "Cannot find module"
- Asegúrate de que `package.json` tenga el script `start`
- Verifica que todas las dependencias estén en `package.json`

### Error: "Port already in use"
- Render asigna el puerto automáticamente, usa `process.env.PORT`

### Las imágenes no se guardan
- Render tiene almacenamiento efímero, usa un servicio de almacenamiento en la nube

## Enlaces Útiles

- [Documentación de Render](https://render.com/docs)
- [Documentación de Railway](https://docs.railway.app)
- [Cloudinary (almacenamiento de imágenes)](https://cloudinary.com)

