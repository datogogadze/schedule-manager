'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'boards',
      [
        {
          id: '396b4f92-fea4-45f8-a3f0-dcb9f49a1888',
          creator_id: '4d53e434-8623-45c3-ab79-cbf657340216',
          name: 'board 1',
          code: '111111',
        },
        {
          id: '961ae41b-fdc8-4140-9c00-aa561d0cefe5',
          creator_id: '78ce53b7-9e9f-41e9-98a4-71695ac65e43',
          name: 'board 2',
          code: '222222',
        },
        {
          id: 'e93dc9c7-0b90-4878-ade0-99af4d3c55b0',
          creator_id: '0916dbe1-97e8-4bd5-85a9-d66f4956b2bd',
          name: 'board 3',
          code: '333333',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('boards', null, {});
  },
};
