// Script para verificar el estado de la base de datos
const { sequelize, User, Product } = require('../models');

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a la base de datos establecida');

    // Contar usuarios
    const userCount = await User.count();
    console.log(`✓ Total de usuarios: ${userCount}`);

    // Contar productos
    const productCount = await Product.count();
    console.log(`✓ Total de productos: ${productCount}`);

    // Mostrar algunos usuarios
    if (userCount > 0) {
      const users = await User.findAll({ limit: 5, attributes: ['id', 'email', 'restaurantName'] });
      console.log('\nUsuarios encontrados:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}, Restaurante: ${user.restaurantName || 'Sin nombre'}`);
      });
    }

    // Mostrar algunos productos
    if (productCount > 0) {
      const products = await Product.findAll({ limit: 5, attributes: ['id', 'name', 'price', 'UserId'] });
      console.log('\nProductos encontrados:');
      products.forEach(product => {
        console.log(`  - ID: ${product.id}, Nombre: ${product.name}, Precio: $${product.price}, UserId: ${product.UserId}`);
      });
    }

    console.log('\n✅ Base de datos verificada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
    process.exit(1);
  }
}

checkDatabase();

