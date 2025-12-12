// Middleware para verificar si el usuario tiene suscripción activa
const { User } = require('../models');

async function checkSubscription(req, res, next) {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Los administradores siempre tienen acceso
    if (user.isAdmin) {
      return next();
    }
    
    // Verificar si la suscripción está activa
    if (!user.subscriptionActive) {
      return res.status(403).json({ 
        error: 'Suscripción inactiva. Por favor, contacta al administrador para reactivar tu cuenta.',
        subscriptionActive: false
      });
    }
    
    // Verificar fecha de expiración si existe
    if (user.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (endDate < today) {
        // Desactivar automáticamente si expiró
        await user.update({ subscriptionActive: false });
        return res.status(403).json({ 
          error: 'Tu suscripción ha expirado. Por favor, renueva tu pago.',
          subscriptionActive: false,
          subscriptionEndDate: user.subscriptionEndDate
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware de suscripción:', error);
    res.status(500).json({ error: 'Error al verificar suscripción' });
  }
}

module.exports = { checkSubscription };

