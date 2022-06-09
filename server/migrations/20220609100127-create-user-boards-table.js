'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_board', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
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
    });

    queryInterface.addConstraint('user_board', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_users_id',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });

    queryInterface.addConstraint('user_board', {
      fields: ['board_id'],
      type: 'foreign key',
      name: 'fk_boards_id',
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
