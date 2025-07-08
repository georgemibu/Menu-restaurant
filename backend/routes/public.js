// backend/routes/publicMenu.js
const express = require('express');
const router = express.Router();
const { User, Product } = require('../models');

router.get('/r/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const user = await User.findOne({ where: { slug } });

    if (!user) return res.status(404).send('Restaurante no encontrado');

    // Traer productos del restaurante (usuario)
    const products = await Product.findAll({ where: { userId: user.id } });

    // Aquí puedes devolver JSON o renderizar vista con productos
    res.json({ restaurant: user.email, products });
  } catch (error) {
    res.status(500).send('Error interno');
  }
});



module.exports = router;
