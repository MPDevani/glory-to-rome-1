'use strict';
module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define('Card', {
  	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    action: DataTypes.STRING,
    handId: DataTypes.INTEGER,
    deckId: DataTypes.INTEGER
  }, {});
  Card.associate = function(models) {
    // associations can be defined here
    Card.belongsTo(models.Hand, {foreignKey: 'handId'});
    Card.belongsTo(models.Deck, {foreignKey: 'deckId'});
  };
  return Card;
};