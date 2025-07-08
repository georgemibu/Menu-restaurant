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

    res.json({
      restaurant: {
        id: user.id,
        email: user.email // o nombre si lo agregamos después
      },
      menu: products
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar el menú' });
  }
});

module.exports = router;
