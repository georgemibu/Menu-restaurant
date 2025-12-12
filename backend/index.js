const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const publicRoutes = require('./routes/public');


const app = express();
app.use(cors());

const path = require('path');

// Middlewares para parsing (excepto multipart/form-data que lo maneja multer)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para favicon (servir archivo si existe, sino responder 204)
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, 'public', 'favicon.ico');
  const fs = require('fs');
  if (fs.existsSync(faviconPath)) {
    res.sendFile(faviconPath);
  } else {
    res.status(204).end(); // No Content - el navegador no mostrará error
  }
});

// Servir archivos estáticos ANTES de aplicar CSP
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Configurar Content-Security-Policy solo para HTML (después de servir estáticos)
app.use((req, res, next) => {
  // Solo aplicar CSP a archivos HTML, no a recursos estáticos
  if (req.path.endsWith('.html') || req.path === '/' || req.path === '/admin.html' || req.path === '/menu.html') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.qrserver.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https://api.qrserver.com;"
    );
  }
  next();
});

app.use('/', publicRoutes);



// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/menu', require('./routes/menu'));


// Usar el puerto que Render asigna automáticamente, o 3001 por defecto
// Render asigna el puerto automáticamente a través de process.env.PORT
const PORT = parseInt(process.env.PORT, 10) || 3001;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces para Render

// Validar que el puerto sea un número válido
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  console.error('Error: Puerto inválido:', process.env.PORT);
  process.exit(1);
}

// Sincronizar modelos con la base de datos (solo crea tablas si no existen)
// NO usar { force: true } ni { alter: true } en producción para evitar pérdida de datos
sequelize.sync().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
    console.log(`Puerto: ${PORT}`);
  });
}).catch(err => {
  console.error('Error al sincronizar la base de datos:', err);
  process.exit(1);
});