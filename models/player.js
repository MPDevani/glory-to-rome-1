'use strict';
module.exports = (sequelize, DataTypes) => {
  const Player = sequelize.define('Player', {
  	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: DataTypes.STRING
  }, {});
  Player.associate = function(models) {
    // associations can be defined here
  };
  return Player;
};