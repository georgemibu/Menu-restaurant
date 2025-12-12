// Script para agregar columnas faltantes a la tabla Users
const { sequelize } = require('../models');

async function addColumns() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    
    // Verificar si las columnas ya existen
    const tableDescription = await queryInterface.describeTable('Users');
    
    console.log('Columnas actuales:', Object.keys(tableDescription));
    
    // Agregar restaurantName si no existe
    if (!tableDescription.restaurantName) {
      await queryInterface.addColumn('Users', 'restaurantName', {
        type: sequelize.Sequelize.STRING,
        allowNull: true
      });
      console.log('✓ Columna restaurantName agregada');
    } else {
      console.log('✓ Columna restaurantName ya existe');
    }
    
    // Agregar themeColors si no existe
    if (!tableDescription.themeColors) {
      await queryInterface.addColumn('Users', 'themeColors', {
        type: sequelize.Sequelize.TEXT,
        allowNull: true
      });
      console.log('✓ Columna themeColors agregada');
    } else {
      console.log('✓ Columna themeColors ya existe');
    }
    
    // Agregar logoUrl si no existe
    if (!tableDescription.logoUrl) {
      await queryInterface.addColumn('Users', 'logoUrl', {
        type: sequelize.Sequelize.STRING,
        allowNull: true
      });
      console.log('✓ Columna logoUrl agregada');
    } else {
      console.log('✓ Columna logoUrl ya existe');
    }
    
    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

addColumns();

