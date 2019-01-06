'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    let addLeaderId = queryInterface.addColumn(
      'Games',
      'leaderId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Players',
          key: 'id'
        }
      }
    );

    let addCurrentTurnId = queryInterface.addColumn(
      'Games',
      'currentTurnId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Players',
          key: 'id'
        }
      }
    );

    return Promise.all([addLeaderId, addCurrentTurnId]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Games', 'leaderId'),
      queryInterface.removeColumn('Games', 'currentTurnId')
    ]);
  }
};
