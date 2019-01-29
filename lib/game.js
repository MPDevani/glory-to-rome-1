const Promise = require('bluebird');

let gameModuleInstance;
let Game;
let Player;
let Deck;
let Hand;
let Card;

class GameModule {
	constructor(db) {
		Game = db.Game;
		Player = db.Player;
		Deck = db.Deck;
		Hand = db.Hand;
		Card = db.Card;
	}

	static getInstance(...args) {
		if (!gameModuleInstance) {
			gameModuleInstance = new GameModule(...args);
		}

		return gameModuleInstance;
	}

	startGame(gameId) {
		let gamePromise = Game.findOne({
			where: {
				id: gameId
			}
		});

		let playersPromise = gamePromise.then((game) => {
			return game.getPlayers()
		});

		// This promise's results look like this:
		//  [{card}, {card}]
		let deckCreationPromise = playersPromise.then((players) => {
			return Deck.create({
				gameId: gameId
			})
		}).then((deck) => {
			let cardProperties = [];
			let numberOfCardsInDeck = 100 - (players.length * 5);
			for (let i = 0; i < numberOfCardsInDeck; i++) {
				cardProperties.push({
					action: "CRAFTSMAN",
					deckId: deck.id
				});
			}
			return Card.bulkCreate(cardProperties);
		});

		// This promise's results look like:
		//  [{player: {...}, cards: [{}, {}, {}] }, {...} ]
		let playerInfoPromises = playersPromise.then((players) => {
			let handCreationPromises = players.map((player) => {
				return handPromise = Hand.create({
					gameId: gameId,
					playerId: player.id
				}).then((hand) => {
					let cardProperties = [];
					for (let i = 0; i < 5; i++) {
						cardProperties.push({
							action: "CRAFTSMAN",
							handId: hand.id
						});
					}
					return Promise.props({
						player: player,
						cards: Card.bulkCreate(cardProperties)
					});
				});
			});
			return Promise.all(handCreationPromises);
		});

		// {game}
		let gameUpdatePromise = Promise.props({
			game: gamePromise,
			players: playersPromise
		}).then((results) => {
			let leaderIndex = Math.floor(Math.random() * results.players.length);
			let leader = results.players[leaderIndex];
			results.players.map((player, index) => {
				return player.setOrder(index);
			});
			game.setLeader(leader);
			game.setCurrentPlayer(leader);
			game.hasStarted = true;
			return game.save();
		})

		// {
		// 	playerInfo: [{player: {player}, cards: [{card}, {card}, {card}] }, {...} ],
		// 	game: {game},
		// 	deck: [{card}, {card}]
		// }
		return Promise.props({
			playerInfo: playerInfoPromises,
			deck: deckCreationPromise,
			game: gameUpdatePromise
		});
	}
}

// When creating a library or module
// 1. Have clearly defined inputs and outputs as a contract
// 2. Look for clear boundaries of responsibility for your libraries.

module.exports = GameModule;