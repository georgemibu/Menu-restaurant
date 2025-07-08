'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Crear la nueva tabla con la estructura deseada (incluyendo slug UNIQUE)
    await queryInterface.createTable('Users_temp', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true, // al principio permitimos null para copiar datos
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    // 2. Copiar los datos de Users a Users_temp sin slug (slug nulo)
    await queryInterface.sequelize.query(`
      INSERT INTO Users_temp (id, email, password, createdAt, updatedAt)
      SELECT id, email, password, createdAt, updatedAt FROM Users;
    `);

    // 3. Borrar la tabla original Users
    await queryInterface.dropTable('Users');

    // 4. Renombrar Users_temp a Users
    await queryInterface.renameTable('Users_temp', 'Users');
  },

  down: async (queryInterface, Sequelize) => {
    // Para revertir la migración, simplemente revertimos el proceso

    await queryInterface.createTable('Users_temp', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      // En esta versión no habrá slug
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    await queryInterface.sequelize.query(`
      INSERT INTO Users_temp (id, email, password, createdAt, updatedAt)
      SELECT id, email, password, createdAt, updatedAt FROM Users;
    `);

    await queryInterface.dropTable('Users');

    await queryInterface.renameTable('Users_temp', 'Users');
  }
};
