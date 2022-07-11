'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_device', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      device_token: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      logged_in: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      session_expires: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint('user_device', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_user_device_users_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_device');
  },
};
