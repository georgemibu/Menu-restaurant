// backend/routes/menu.js
const express = require('express');
const router = express.Router();
const { User, Product } = require('../models');

// Obtener el menú público de un restaurante (por su ID)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Restaurante no encontrado' });

    const products = await Product.findAll({
      where: { UserId: userId },
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
        description: user.description,
        welcomeMessage: user.welcomeMessage,
        phone: user.phone,
        address: user.address,
        hours: hours,
        whatsapp: user.whatsapp,
        instagram: user.instagram,
        facebook: user.facebook
      },
      menu: products
    });
  } catch (err) {
    console.error('Error al cargar el menú:', err);
    res.status(500).json({ error: 'Error al cargar el menú' });
  }
});

module.exports = router;
