'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: uuidv4(),
          email: 'johndoe1@mail.com',
        },
        {
          id: uuidv4(),
          email: 'johndoe2@mail.com',
        },
        {
          id: uuidv4(),
          email: 'johndoe3@mail.com',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
