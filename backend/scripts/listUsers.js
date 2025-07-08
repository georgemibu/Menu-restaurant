// scripts/listUsers.js

const { User } = require('../models'); // Ajusta la ruta según dónde tengas el archivo
async function listUsers() {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'slug'], // si no tenés slug, sacalo o agrega el campo
    });

    users.forEach(user => {
      console.log(`ID: ${user.id} - Email: ${user.email} - Slug: ${user.slug || 'No slug'}`);
    });
  } catch (err) {
    console.error('Error listando usuarios:', err);
  }
}

listUsers();