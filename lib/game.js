const Promise = require('bluebird');

let gameModuleInstance;
let Game;
let Player;
let Deck;
let Hand;

class GameModule {
	constructor(db) {
		Game = db.Game;
		Player = db.Player;
		Deck = db.Deck;
		Hand = db.Hand;
	}

	static getInstance(...args) {
		if (!gameModuleInstance) {
			gameModuleInstance = new GameModule(...args);
		}

		return gameModuleInstance;
	}

	startGame(gameId) {
		// These are the steps we need to implement
		// 1. Create a deck
		// 2. Create N number of player hands
		// 3. Update number of cards for playerhands and deck
		// 4. Pick a player to go first (Still need to do this)
		// 5. Return
		//      - Deck
		//      - Playerhands

		// We create a promise to find our game. We chain that to a promise to find
		// all of the players for this game. We store this promise in a variable.
		// To use "playersPromise", you can call .then on it and the argument will be
		// players.
		let gamePromise = Game.findOne({
			where: {
				id: gameId
			}
		});

		let gameUpdatePromise = gamePromise.then((game) => {
			game.hasStarted = true;
			return game.save();
		});

		let playersPromise = gamePromise.then((game) => {
			return game.getPlayers()
		});

		// Once we have all of the players, we create a deck. We need players in order
		// to set the proper cardCount.
		// We store this promise in a variable as well.
		let deckCreationPromise = playersPromise.then((players) => {
			return Deck.create({
				gameId: gameId,
				cardCount: 100 - (players.length * 5)
			})
		});

		// We attach a second .then statement to playersPromise to create all of the
		// players' hands.
		let playerInfoPromises = playersPromise.then((players) => {
			// Because we need to create a hand for each player, we have to iterate through
			// the players array. We use .map in order to track each generated promise.
			let handCreationPromises = players.map((player) => {
				let handPromise = Hand.create({
					gameId: gameId,
					cardCount: 5,
					playerId: player.id
				});

				// We want to associate the player and hand, so rather than just returning
				// handPromise, we create an object and return the promise of those two.
				// The result of this promise will be in the format presented below.
				return Promise.props({
					player: player,
					hand: handPromise
				});
			});

			// This returns the promise that is an accumulation of each player's
			// "handeCreationPromise".
			return Promise.all(handCreationPromises);
		});

		// We create one final promise so that all of the DB changes we've made can finish.
		// Once the deck is created and the playerInfo is ready, we can return the results.
		// The format of the result will be:
		// {
		// 	deck: DeckModel,
		// 	playerInfo: [
		// 		{
		// 			player: playerModel,
		// 			hand: handModel
		// 		},
		// 		...
		// 	]
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