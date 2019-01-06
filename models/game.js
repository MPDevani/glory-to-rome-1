'use strict';
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define('Game', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    gameCode: DataTypes.STRING
  }, {});

  Game.associate = function(models) {
    // associations can be defined here
    Game.hasMany(models.Player, {foreignKey: 'gameId'});
    Game.hasOne(models.Deck, {foreignKey: 'gameId'});
    Game.hasMany(models.Hand, {foreignKey: 'gameId'});

    Game.belongsTo(models.Player, {as: 'leader', foreignKey: 'leaderId'});
    Game.belongsTo(models.Player, {as: 'currentTurn', foreignKey: 'currentTurnId'});
  };

  return Game;
};