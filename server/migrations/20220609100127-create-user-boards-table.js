'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_board', {
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
      board_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint('user_board', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_user_board_users_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });

    await queryInterface.addConstraint('user_board', {
      fields: ['board_id'],
      type: 'foreign key',
      name: 'fk_user_board_boards_id',
      references: {
        table: 'boards',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_board');
  },
};
