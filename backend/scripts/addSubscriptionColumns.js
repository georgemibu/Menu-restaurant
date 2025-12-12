// Script para agregar columnas de suscripción y administración
const { sequelize } = require('../models');

async function addColumns() {
  try {
    const queryInterface = sequelize.getQueryInterface();
    
    // Verificar columnas de Users
    const usersTable = await queryInterface.describeTable('Users');
    console.log('Verificando tabla Users...');
    
    const userColumns = [
      { name: 'isAdmin', type: 'BOOLEAN', defaultValue: false },
      { name: 'subscriptionActive', type: 'BOOLEAN', defaultValue: true },
      { name: 'subscriptionStartDate', type: 'DATE' },
      { name: 'subscriptionEndDate', type: 'DATE' },
      { name: 'lastPaymentDate', type: 'DATE' }
    ];
    
    for (const col of userColumns) {
      if (!usersTable[col.name]) {
        const columnDef = {
          type: sequelize.Sequelize[col.type],
          allowNull: true
        };
        
        if (col.defaultValue !== undefined) {
          columnDef.defaultValue = col.defaultValue;
        }
        
        await queryInterface.addColumn('Users', col.name, columnDef);
        console.log(`✓ Columna ${col.name} agregada a Users`);
      } else {
        console.log(`✓ Columna ${col.name} ya existe en Users`);
      }
    }
    
    // Hacer el primer usuario admin si no hay ninguno
    const { User } = require('../models');
    const adminCount = await User.count({ where: { isAdmin: true } });
    if (adminCount === 0) {
      const firstUser = await User.findOne({ order: [['id', 'ASC']] });
      if (firstUser) {
        await firstUser.update({ isAdmin: true, subscriptionActive: true });
        console.log(`✓ Usuario ${firstUser.email} marcado como administrador`);
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

