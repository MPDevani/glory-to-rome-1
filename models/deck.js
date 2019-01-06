'use strict';
module.exports = (sequelize, DataTypes) => {
  const Deck = sequelize.define('Deck', {
  	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    gameId: DataTypes.INTEGER,
    cardCount: DataTypes.INTEGER
  }, {});
  Deck.associate = function(models) {
    // associations can be defined here
    Deck.belongsTo(models.Game, {foreignKey: 'gameId'});
  };
  return Deck;
};