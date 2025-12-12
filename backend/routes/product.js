const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { authenticateToken } = require('../middlewares/authmiddleware');
const { checkSubscription } = require('../middlewares/subscriptionMiddleware');
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
    const { User } = require('../models');
    const where = {};
    if (req.query.user) {
      where.UserId = req.query.user;
    } else {
      return res.status(400).json({ error: 'Falta el parámetro ?user=' });
    }

    const products = await Product.findAll({ where });
    
    // Incluir información del restaurante con preferencias
    const user = await User.findByPk(req.query.user);
    if (user) {
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

      return res.json({
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
        products: products
      });
    }
    
    res.json(products);
  } catch (err) {
    console.error('Error en ruta pública:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});


// RUTA PRIVADA (admin) — productos del usuario logueado
router.get('/', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const products = await Product.findAll({ where: { UserId: req.userId } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});



// Crear un producto con imagen opcional
router.post('/', authenticateToken, checkSubscription, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, tags, available } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = `uploads/${req.file.filename}`;
    }

    // Procesar tags
    let tagsJson = null;
    if (tags) {
      try {
        const parsed = typeof tags === 'string' ? JSON.parse(tags) : tags;
        tagsJson = JSON.stringify(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        tagsJson = null;
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      tags: tagsJson,
      available: available !== undefined ? (available === 'true' || available === true) : true,
      UserId: req.userId
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Actualizar producto con posible nueva imagen
router.put('/:id', authenticateToken, checkSubscription, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ where: { id, UserId: req.userId } });

    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const { name, description, price, category, tags, available } = req.body;

    const updateData = { name, description, price, category };

    if (req.file) {
      updateData.imageUrl = `uploads/${req.file.filename}`;
    }

    // Procesar tags
    if (tags !== undefined) {
      try {
        const parsed = typeof tags === 'string' ? JSON.parse(tags) : tags;
        updateData.tags = JSON.stringify(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        updateData.tags = null;
      }
    }

    // Procesar disponibilidad
    if (available !== undefined) {
      updateData.available = available === 'true' || available === true;
    }

    await product.update(updateData);

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto
router.delete('/:id', authenticateToken, checkSubscription, async (req, res) => {
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
