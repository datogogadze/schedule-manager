'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('exclusions', 'notification_time', {
      type: Sequelize.INTEGER,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('exclusions', 'notification_time');
  },
};
