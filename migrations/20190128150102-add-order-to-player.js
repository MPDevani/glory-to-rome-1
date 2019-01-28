'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        'Players',
        'order',
        {
          type: Sequelize.INTEGER,
          allowNull: false
        }
      )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Players', 'order');
  }
};
