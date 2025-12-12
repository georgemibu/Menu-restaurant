// backend/routes/publicMenu.js
const express = require('express');
const router = express.Router();
const { User, Product } = require('../models');

// Función para generar slug desde nombre del restaurante
function generateRestaurantSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/final
}

// Ruta por slug del usuario (mantener compatibilidad)
router.get('/r/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const user = await User.findOne({ where: { slug } });

    if (!user) return res.status(404).json({ error: 'Restaurante no encontrado' });

    // Traer productos del restaurante (usuario)
    const products = await Product.findAll({ 
      where: { UserId: user.id },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    // Parsear themeColors si existe
    let themeColors = null;
    if (user.themeColors) {
      try {
        themeColors = JSON.parse(user.themeColors);
      } catch (e) {
        themeColors = null;
      }
    }

    res.json({ 
      restaurant: {
        id: user.id,
        email: user.email,
        restaurantName: user.restaurantName || user.email,
        logoUrl: user.logoUrl,
        themeColors: themeColors,
        restaurantSlug: user.restaurantName ? generateRestaurantSlug(user.restaurantName) : null
      },
      products 
    });
  } catch (error) {
    console.error('Error en ruta pública:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Nueva ruta por nombre del restaurante
router.get('/restaurant/:restaurantSlug', async (req, res) => {
  try {
    const restaurantSlug = req.params.restaurantSlug;
    
    // Buscar usuario por nombre del restaurante (comparando slugs)
    const users = await User.findAll();
    const user = users.find(u => {
      if (!u.restaurantName) return false;
      const userSlug = generateRestaurantSlug(u.restaurantName);
      return userSlug === restaurantSlug;
    });

    if (!user) return res.status(404).json({ error: 'Restaurante no encontrado' });

    // Traer productos del restaurante
    const products = await Product.findAll({ 
      where: { UserId: user.id },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    // Parsear themeColors si existe
    let themeColors = null;
    if (user.themeColors) {
      try {
        themeColors = JSON.parse(user.themeColors);
      } catch (e) {
        themeColors = null;
      }
    }

    // Parsear hours si existe
    let hours = null;
    if (user.hours) {
      try {
        hours = typeof user.hours === 'string' ? JSON.parse(user.hours) : user.hours;
      } catch (e) {
        hours = null;
      }
    }

    res.json({ 
      restaurant: {
        id: user.id,
        email: user.email,
        restaurantName: user.restaurantName || user.email,
        logoUrl: user.logoUrl,
        themeColors: themeColors,
        restaurantSlug: generateRestaurantSlug(user.restaurantName || user.email),
        description: user.description,
        welcomeMessage: user.welcomeMessage,
        phone: user.phone,
        address: user.address,
        hours: hours,
        whatsapp: user.whatsapp,
        instagram: user.instagram,
        facebook: user.facebook
      },
      products 
    });
  } catch (error) {
    console.error('Error en ruta por nombre:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});



module.exports = router;
