'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    let createCard = queryInterface.createTable('Cards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        unique: true
      },
      action: {
        type: Sequelize.STRING
      },
      handId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Hands',
          key: 'id'
        }
      },
      deckId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Decks',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    return Promise.all([
      createCard,
      queryInterface.removeColumn('Decks', 'cardCount'),
      queryInterface.removeColumn('Hands', 'cardCount')
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.dropTable('Cards'),
      queryInterface.addColumn('Decks', 'cardCount', {type: Sequelize.INTEGER}),
      queryInterface.addColumn('Hands', 'cardCount', {type: Sequelize.INTEGER})
    ]);
  }
};