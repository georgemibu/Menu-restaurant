const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: DataTypes.STRING,
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Temporalmente permitir null para usuarios existentes
    },
    restaurantName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    themeColors: {
      type: DataTypes.TEXT, // JSON como string
      allowNull: true,
      defaultValue: JSON.stringify({
        gradientStart: '#667eea',
        gradientEnd: '#764ba2',
        textColor: '#ffffff',
        accentColor: '#27ae60',
        cardBackground: '#ffffff',
        categoryColor: '#667eea'
      })
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Información del restaurante
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    welcomeMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hours: {
      type: DataTypes.TEXT, // JSON como string
      allowNull: true,
    },
    // Redes sociales
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Campos de administración y suscripción
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subscriptionActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    subscriptionStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Hashea contraseña antes de guardar
  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  return User;
};
