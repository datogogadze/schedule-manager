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
          email_verified: true,
          first_name: 'John',
          last_name: 'Doe',
          display_name: 'John Doe',
          password_hash:
            '$2a$10$wYFASriZ8ylXwkyXGBTzmuWrCiz7fdKlg5bviHlM9hlQ7l8.Fu9ti',
        },
        {
          id: uuidv4(),
          email: 'johndoe2@mail.com',
          email_verified: true,
          first_name: 'John',
          last_name: 'Doe',
          display_name: 'John Doe',
          password_hash:
            '$2a$10$wYFASriZ8ylXwkyXGBTzmuWrCiz7fdKlg5bviHlM9hlQ7l8.Fu9ti',
        },
        {
          id: uuidv4(),
          email: 'johndoe3@mail.com',
          email_verified: false,
          first_name: 'John',
          last_name: 'Doe',
          display_name: 'John Doe',
          password_hash:
            '$2a$10$wYFASriZ8ylXwkyXGBTzmuWrCiz7fdKlg5bviHlM9hlQ7l8.Fu9ti',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
