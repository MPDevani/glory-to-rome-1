'use strict';
module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
  	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: DataTypes.STRING,
    order: { type: DataTypes.INTEGER, allowNull: true }
  }, {});
  Player.associate = function(models) {
    // associations can be defined here
    Player.belongsTo(models.Game, {foreignKey: 'gameId'});
    Player.hasOne(models.Hand, {foreignKey: 'playerId'});
  };
  return Player;
};