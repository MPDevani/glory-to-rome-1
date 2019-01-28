'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    let promises = [
      queryInterface.addColumn(
        'Games',
        'stage',
        {
          type: Sequelize.TEXT,
          defaultValue: "START",
          allowNull: false
        }
      ),
      queryInterface.addColumn(
        'Games',
        'currentAction',
        {
          type: Sequelize.TEXT,
          allowNull: true
        }
      )
    ];

    return Promise.all(promises);
  },

  down: (queryInterface, Sequelize) => {
    Promise.all([
      queryInterface.removeColumn('Games', 'stage'),
      queryInterface.removeColumn('Games', 'currentAction'),
    ]);
  }
};
