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

	createPlayerHands(players, gameId) {
		let handCreationPromises = players.map((player) => {
			console.log("Hand's game id: ", gameId);
			return Hand.create({
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
	}

	initializeGame(players, game) {
		let leaderIndex = Math.floor(Math.random() * players.length);
		let leader = players[leaderIndex];
		let playerUpdate = players.map((player, index) => {
			player.order = index;
			return player.save();
		});
		game.setLeader(leader);
		game.setCurrentTurn(leader);
		game.hasStarted = true;

		return Promise.props({
			game: game.save(),
			players: playerUpdate
		}).then((results) => {
			return results.game;
		});
	}

	createDeck(numberOfPlayers, gameId) {
		return Deck.create({
			gameId: gameId
		}).then((deck) => {
			let cardProperties = [];
			let numberOfCardsInDeck = 100 - (numberOfPlayers * 5);
			for (let i = 0; i < numberOfCardsInDeck; i++) {
				cardProperties.push({
					action: "CRAFTSMAN",
					deckId: deck.id
				});
			}
			return Card.bulkCreate(cardProperties);
		});
	}

	/*
	 * Output: {
	 *   deck: [{card}, {card}],
	 *   playersInfo: [{player: {...}, cards: [{}, {}, {}] }, {...} ],
	 *   game: {game}
	 * }
	 */
	startGame(gameId) {
		let gamePromise = Game.findOne({
			where: {
				id: gameId
			}
		});

		let playersPromise = gamePromise.then((game) => {
			return game.getPlayers()
		});

		return Promise.all([gamePromise, playersPromise]).spread((game, players) => {
			return Promise.props({
				playerInfo: this.createPlayerHands(players, game.id),
				deck: this.createDeck(players.length, game.id),
				game: this.initializeGame(players, game)
			});
		});
	}
}

// When creating a library or module
// 1. Have clearly defined inputs and outputs as a contract
// 2. Look for clear boundaries of responsibility for your libraries.

module.exports = GameModule;