// Script para hacer respaldo de la base de datos
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const backupPath = path.join(__dirname, `../database_backup_${Date.now()}.sqlite`);

try {
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ Respaldo creado: ${backupPath}`);
    console.log(`   Tamaño: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`);
  } else {
    console.log('❌ No se encontró la base de datos');
  }
} catch (error) {
  console.error('❌ Error al crear respaldo:', error);
  process.exit(1);
}

