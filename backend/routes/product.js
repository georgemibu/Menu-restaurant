const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { authenticateToken } = require('../middlewares/authmiddleware');
const multer = require('multer');
const path = require('path');

// Configuración multer para guardar imágenes en /uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // carpeta uploads debe existir
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Obtener todos los productos del usuario logueado
/*router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.findAll({ where: { UserId: req.userId } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});
*/

// RUTA PÚBLICA (menú del restaurante)
router.get('/public', async (req, res) => {
  try {
    const where = {};
    if (req.query.user) {
      where.userId = req.query.user;
    } else {
      return res.status(400).json({ error: 'Falta el parámetro ?user=' });
    }

    const products = await Product.findAll({ where });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});


// RUTA PRIVADA (admin) — productos del usuario logueado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const products = await Product.findAll({ where: { userId: req.userId } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});



// Crear un producto con imagen opcional
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      UserId: req.userId
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Actualizar producto con posible nueva imagen
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ where: { id, UserId: req.userId } });

    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const { name, description, price, category } = req.body;

    if (req.file) {
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

    await product.update({ name, description, price, category, imageUrl: product.imageUrl });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ where: { id, UserId: req.userId } });

    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    await product.destroy();
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
