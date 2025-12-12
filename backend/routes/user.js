// backend/routes/user.js
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticateToken } = require('../middlewares/authmiddleware');
const { checkSubscription } = require('../middlewares/subscriptionMiddleware');
const multer = require('multer');
const path = require('path');

// Configuración multer para logo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Obtener información del usuario actual
router.get('/me', authenticateToken, checkSubscription, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: [
        'id', 'email', 'slug', 'restaurantName', 'themeColors', 'logoUrl',
        'description', 'welcomeMessage', 'phone', 'address', 'hours',
        'whatsapp', 'instagram', 'facebook', 'isAdmin', 'subscriptionActive',
        'subscriptionStartDate', 'subscriptionEndDate', 'lastPaymentDate', 'createdAt'
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Parsear JSON fields si existen
    const userData = user.toJSON();
    
    // Parsear themeColors
    if (userData.themeColors) {
      try {
        if (typeof userData.themeColors === 'string') {
          userData.themeColors = JSON.parse(userData.themeColors);
        }
      } catch (e) {
        console.error('Error parseando themeColors:', e);
        userData.themeColors = {
          gradientStart: '#667eea',
          gradientEnd: '#764ba2',
          textColor: '#ffffff',
          accentColor: '#27ae60',
          cardBackground: '#ffffff',
          categoryColor: '#667eea'
        };
      }
    } else {
      userData.themeColors = {
        gradientStart: '#667eea',
        gradientEnd: '#764ba2',
        textColor: '#ffffff',
        accentColor: '#27ae60',
        cardBackground: '#ffffff',
        categoryColor: '#667eea'
      };
    }
    
    // Parsear hours si existe
    if (userData.hours) {
      try {
        if (typeof userData.hours === 'string') {
          userData.hours = JSON.parse(userData.hours);
        }
      } catch (e) {
        userData.hours = null;
      }
    }

    res.json(userData);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
});

// Actualizar preferencias de diseño
router.put('/preferences', authenticateToken, checkSubscription, upload.single('logo'), async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si el usuario no es admin, ignorar cualquier campo de suscripción que pueda venir
    const isAdmin = user.isAdmin;

    const {
      restaurantName,
      themeColors,
      description,
      welcomeMessage,
      phone,
      address,
      hours,
      whatsapp,
      instagram,
      facebook,
      // Campos de suscripción (solo para admins)
      subscriptionActive,
      subscriptionStartDate,
      subscriptionEndDate,
      lastPaymentDate
    } = req.body;
    const updateData = {};

    if (restaurantName !== undefined) {
      updateData.restaurantName = restaurantName;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (welcomeMessage !== undefined) {
      updateData.welcomeMessage = welcomeMessage;
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (address !== undefined) {
      updateData.address = address;
    }

    if (hours !== undefined) {
      // hours puede venir como string JSON o como objeto
      try {
        const parsed = typeof hours === 'string' ? JSON.parse(hours) : hours;
        updateData.hours = JSON.stringify(parsed);
      } catch (e) {
        updateData.hours = JSON.stringify(hours);
      }
    }

    if (whatsapp !== undefined) {
      updateData.whatsapp = whatsapp;
    }

    if (instagram !== undefined) {
      updateData.instagram = instagram;
    }

    if (facebook !== undefined) {
      updateData.facebook = facebook;
    }

    if (themeColors) {
      // Validar que sea un JSON válido
      try {
        let parsed;
        if (typeof themeColors === 'string') {
          // Si viene como string, intentar parsearlo
          if (themeColors.trim() === '') {
            return res.status(400).json({ error: 'themeColors no puede estar vacío' });
          }
          parsed = JSON.parse(themeColors);
        } else {
          parsed = themeColors;
        }
        // Validar que sea un objeto
        if (typeof parsed !== 'object' || parsed === null) {
          return res.status(400).json({ error: 'themeColors debe ser un objeto JSON válido' });
        }
        updateData.themeColors = JSON.stringify(parsed);
      } catch (e) {
        console.error('Error parseando themeColors en PUT:', e);
        return res.status(400).json({ error: 'themeColors debe ser un JSON válido: ' + e.message });
      }
    }

    if (req.file) {
      updateData.logoUrl = `uploads/${req.file.filename}`;
    }

    // Solo permitir modificar campos de suscripción si el usuario es admin
    if (isAdmin) {
      if (subscriptionActive !== undefined) {
        updateData.subscriptionActive = subscriptionActive;
      }
      if (subscriptionStartDate !== undefined) {
        updateData.subscriptionStartDate = subscriptionStartDate || null;
      }
      if (subscriptionEndDate !== undefined) {
        updateData.subscriptionEndDate = subscriptionEndDate || null;
      }
      if (lastPaymentDate !== undefined) {
        updateData.lastPaymentDate = lastPaymentDate || null;
      }
    }
    // Si no es admin, ignoramos cualquier campo de suscripción que pueda venir

    await user.update(updateData);
    
    // Recargar el usuario para obtener los datos actualizados
    await user.reload();

    const userData = user.toJSON();
    
    // Parsear themeColors
    if (userData.themeColors) {
      try {
        if (typeof userData.themeColors === 'string') {
          userData.themeColors = JSON.parse(userData.themeColors);
        }
      } catch (e) {
        console.error('Error parseando themeColors después de actualizar:', e);
        userData.themeColors = {
          gradientStart: '#667eea',
          gradientEnd: '#764ba2',
          textColor: '#ffffff',
          accentColor: '#27ae60',
          cardBackground: '#ffffff',
          categoryColor: '#667eea'
        };
      }
    }
    
    // Parsear hours
    if (userData.hours) {
      try {
        if (typeof userData.hours === 'string') {
          userData.hours = JSON.parse(userData.hours);
        }
      } catch (e) {
        userData.hours = null;
      }
    }

    res.json(userData);
  } catch (err) {
    console.error('Error al actualizar preferencias:', err);
    res.status(500).json({ error: 'Error al actualizar preferencias' });
  }
});

module.exports = router;

