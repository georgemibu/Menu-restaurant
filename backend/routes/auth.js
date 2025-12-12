// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

// Función para generar slug desde email
function generateSlug(email) {
  return email
    .split('@')[0] // toma la parte antes del @
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // reemplaza caracteres especiales con guiones
    .replace(/^-+|-+$/g, ''); // elimina guiones al inicio/final
}

// Registro
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Verificamos si ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }

    // Generar slug único
    let baseSlug = generateSlug(email);
    let slug = baseSlug;
    let counter = 1;
    
    // Asegurar que el slug sea único
    while (await User.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const user = await User.create({ email, password, slug });

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email,
        slug: user.slug 
      } 
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error en el registro' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email,
        slug: user.slug 
      } 
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el login' });
  }
});

module.exports = router;
