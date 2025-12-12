/*const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);

  // Extraer solo el token, sin "Bearer "
  const token = authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'CLAVE_SECRETA', (err, user) => {
    if (err) return res.sendStatus(403);
    req.userId = user.id;
    next();
  });
}
*/
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
  // Express normaliza los headers a lowercase, pero también verificar ambos casos
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  console.log('Authorization header:', authHeader);
  console.log('Todos los headers:', Object.keys(req.headers));

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token de autenticación inválido' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log('JWT verify error:', err);
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    console.log('User verified:', user);
    req.userId = user.id;
    next();
  });
}


module.exports = { authenticateToken };




/*
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'CLAVE_SECRETA', (err, user) => {
    if (err) return res.sendStatus(403);
    req.userId = user.id;
    next();
  });
}

module.exports = { authenticateToken };
*/