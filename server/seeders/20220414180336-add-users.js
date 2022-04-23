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
            '$2a$10$LHNg807mSDh38zFZJdvf0uY7WKZSo8lNVhFllDUhyV3.hOyn5rug.',
        },
        {
          id: uuidv4(),
          email: 'johndoe2@mail.com',
          email_verified: true,
          first_name: 'John',
          last_name: 'Doe',
          display_name: 'John Doe',
          password_hash:
            '$2a$10$LHNg807mSDh38zFZJdvf0uY7WKZSo8lNVhFllDUhyV3.hOyn5rug.',
        },
        {
          id: uuidv4(),
          email: 'johndoe3@mail.com',
          email_verified: false,
          first_name: 'John',
          last_name: 'Doe',
          display_name: 'John Doe',
          password_hash:
            '$2a$10$LHNg807mSDh38zFZJdvf0uY7WKZSo8lNVhFllDUhyV3.hOyn5rug.',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
