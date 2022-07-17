'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: '4d53e434-8623-45c3-ab79-cbf657340216',
          email: 'johndoe1@mail.com',
          email_verified: true,
          first_name: 'John',
          last_name: 'Doe',
          display_name: 'John Doe',
          password_hash:
            '$2a$10$wYFASriZ8ylXwkyXGBTzmuWrCiz7fdKlg5bviHlM9hlQ7l8.Fu9ti',
        },
        {
          id: '78ce53b7-9e9f-41e9-98a4-71695ac65e43',
          email: 'johndoe2@mail.com',
          email_verified: true,
          first_name: 'John',
          last_name: 'Doe',
          display_name: 'John Doe',
          password_hash:
            '$2a$10$wYFASriZ8ylXwkyXGBTzmuWrCiz7fdKlg5bviHlM9hlQ7l8.Fu9ti',
        },
        {
          id: '0916dbe1-97e8-4bd5-85a9-d66f4956b2bd',
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
