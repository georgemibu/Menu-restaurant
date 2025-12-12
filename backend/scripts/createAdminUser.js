// Script para crear un usuario administrador
const { sequelize } = require('../models');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    const email = 'georgemibu@gmail.com';
    const password = '123456';

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      // Si existe, actualizar a admin
      existingUser.isAdmin = true;
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt);
      await existingUser.save();
      console.log('✅ Usuario existente actualizado como administrador:', email);
    } else {
      // Si no existe, crear nuevo usuario admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Generar slug desde email
      function generateSlug(email) {
        return email
          .split('@')[0]
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      
      let baseSlug = generateSlug(email);
      let slug = baseSlug;
      let counter = 1;
      
      while (await User.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const user = await User.create({
        email,
        password: hashedPassword,
        slug,
        isAdmin: true,
        subscriptionActive: true,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
      });

      console.log('✅ Usuario administrador creado:', email);
      console.log('   - Slug:', user.slug);
      console.log('   - Admin:', user.isAdmin);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();

