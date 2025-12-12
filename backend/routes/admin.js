// Rutas de administración de usuarios
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticateToken } = require('../middlewares/authmiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const bcrypt = require('bcryptjs');

// Todas las rutas requieren autenticación y ser admin
router.use(authenticateToken);
router.use(requireAdmin);

// Listar todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'id', 'email', 'restaurantName', 'slug', 'isAdmin',
        'subscriptionActive', 'subscriptionStartDate', 
        'subscriptionEndDate', 'lastPaymentDate', 'createdAt'
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener un usuario específico
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: [
        'id', 'email', 'restaurantName', 'slug', 'isAdmin',
        'subscriptionActive', 'subscriptionStartDate', 
        'subscriptionEndDate', 'lastPaymentDate', 'createdAt'
      ]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Crear nuevo usuario
router.post('/users', async (req, res) => {
  try {
    const { email, password, restaurantName, isAdmin, subscriptionActive, subscriptionEndDate } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }
    
    // Generar slug
    const generateSlug = (email) => {
      return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    };
    
    let baseSlug = generateSlug(email);
    let slug = baseSlug;
    let counter = 1;
    while (await User.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Calcular fechas de suscripción
    const startDate = new Date();
    let endDate = null;
    if (subscriptionEndDate) {
      endDate = new Date(subscriptionEndDate);
    } else if (subscriptionActive) {
      // Por defecto, 30 días desde hoy
      endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
    }
    
    const user = await User.create({
      email,
      password,
      slug,
      restaurantName: restaurantName || null,
      isAdmin: isAdmin || false,
      subscriptionActive: subscriptionActive !== false,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
      lastPaymentDate: subscriptionActive ? startDate : null
    });
    
    res.status(201).json({
      id: user.id,
      email: user.email,
      restaurantName: user.restaurantName,
      slug: user.slug,
      isAdmin: user.isAdmin,
      subscriptionActive: user.subscriptionActive,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      lastPaymentDate: user.lastPaymentDate,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const { 
      email, 
      password, 
      restaurantName, 
      isAdmin, 
      subscriptionActive, 
      subscriptionStartDate,
      subscriptionEndDate, 
      lastPaymentDate 
    } = req.body;
    
    const updateData = {};
    
    if (email !== undefined && email !== user.email) {
      // Verificar que el nuevo email no esté en uso
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(400).json({ error: 'El email ya está en uso' });
      }
      updateData.email = email;
    }
    
    if (password !== undefined && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    
    if (restaurantName !== undefined) {
      updateData.restaurantName = restaurantName;
    }
    
    if (isAdmin !== undefined) {
      updateData.isAdmin = isAdmin;
    }
    
    if (subscriptionActive !== undefined) {
      updateData.subscriptionActive = subscriptionActive;
    }
    
    if (subscriptionStartDate !== undefined) {
      updateData.subscriptionStartDate = subscriptionStartDate ? new Date(subscriptionStartDate) : null;
    }
    
    if (subscriptionEndDate !== undefined) {
      updateData.subscriptionEndDate = subscriptionEndDate ? new Date(subscriptionEndDate) : null;
    }
    
    if (lastPaymentDate !== undefined) {
      updateData.lastPaymentDate = lastPaymentDate ? new Date(lastPaymentDate) : null;
    }
    
    await user.update(updateData);
    
    res.json({
      id: user.id,
      email: user.email,
      restaurantName: user.restaurantName,
      slug: user.slug,
      isAdmin: user.isAdmin,
      subscriptionActive: user.subscriptionActive,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      lastPaymentDate: user.lastPaymentDate,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir eliminar a uno mismo
    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Registrar pago de suscripción
router.post('/users/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentDate, subscriptionEndDate } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const updateData = {
      subscriptionActive: true,
      lastPaymentDate: paymentDate ? new Date(paymentDate) : new Date()
    };
    
    if (subscriptionEndDate) {
      updateData.subscriptionEndDate = new Date(subscriptionEndDate);
    } else {
      // Por defecto, 30 días desde el pago
      const endDate = new Date(updateData.lastPaymentDate);
      endDate.setDate(endDate.getDate() + 30);
      updateData.subscriptionEndDate = endDate;
    }
    
    await user.update(updateData);
    
    res.json({
      id: user.id,
      email: user.email,
      subscriptionActive: user.subscriptionActive,
      lastPaymentDate: user.lastPaymentDate,
      subscriptionEndDate: user.subscriptionEndDate
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

module.exports = router;

