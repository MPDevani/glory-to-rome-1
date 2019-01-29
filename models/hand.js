'use strict';
module.exports = (sequelize, DataTypes) => {
  const Hand = sequelize.define('Hand', {
    gameId: DataTypes.INTEGER,
    cardCount: DataTypes.INTEGER,
    playerId: DataTypes.INTEGER
  }, {});
  Hand.associate = function(models) {
    // associations can be defined here
    Hand.belongsTo(models.Game, {foreignKey: 'gameId'});
    Hand.belongsTo(models.Player, {foreignKey: 'playerId'});

    Hand.hasMany(models.Card, {foreignKey: 'handId'});
  };
  return Hand;
};