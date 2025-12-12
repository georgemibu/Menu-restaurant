// Script para agregar columnas de información del restaurante y etiquetas de productos
const { sequelize } = require('../models');

async function addColumns() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    
    // Verificar columnas de Users
    const usersTable = await queryInterface.describeTable('Users');
    console.log('Verificando tabla Users...');
    
    const userColumns = [
      { name: 'description', type: 'TEXT' },
      { name: 'welcomeMessage', type: 'TEXT' },
      { name: 'phone', type: 'VARCHAR(255)' },
      { name: 'address', type: 'VARCHAR(255)' },
      { name: 'hours', type: 'TEXT' },
      { name: 'whatsapp', type: 'VARCHAR(255)' },
      { name: 'instagram', type: 'VARCHAR(255)' },
      { name: 'facebook', type: 'VARCHAR(255)' }
    ];
    
    for (const col of userColumns) {
      if (!usersTable[col.name]) {
        await queryInterface.addColumn('Users', col.name, {
          type: sequelize.Sequelize[col.type === 'TEXT' ? 'TEXT' : 'STRING'],
          allowNull: true
        });
        console.log(`✓ Columna ${col.name} agregada a Users`);
      } else {
        console.log(`✓ Columna ${col.name} ya existe en Users`);
      }
    }
    
    // Verificar columnas de Products
    const productsTable = await queryInterface.describeTable('Products');
    console.log('\nVerificando tabla Products...');
    
    const productColumns = [
      { name: 'tags', type: 'TEXT' },
      { name: 'available', type: 'BOOLEAN' }
    ];
    
    for (const col of productColumns) {
      if (!productsTable[col.name]) {
        if (col.type === 'BOOLEAN') {
          await queryInterface.addColumn('Products', col.name, {
            type: sequelize.Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: true
          });
        } else {
          await queryInterface.addColumn('Products', col.name, {
            type: sequelize.Sequelize.TEXT,
            allowNull: true
          });
        }
        console.log(`✓ Columna ${col.name} agregada a Products`);
      } else {
        console.log(`✓ Columna ${col.name} ya existe en Products`);
      }
    }
    
    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

addColumns();

