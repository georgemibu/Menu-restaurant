// Middleware para verificar si el usuario es administrador
const { User } = require('../models');

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware de admin:', error);
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
}

module.exports = { requireAdmin };

