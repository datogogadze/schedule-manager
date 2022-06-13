'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true,
      },
      display_name: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      password_hash: {
        type: Sequelize.STRING(128),
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      image_url: {
        type: Sequelize.STRING(256),
      },
      external_type: {
        type: Sequelize.STRING(16),
      },
      external_id: {
        type: Sequelize.STRING(64),
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
