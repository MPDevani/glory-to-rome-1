const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const db = require('./models/index.js');
const Game = db.Game;
const Player = db.Player;
const Deck = db.Deck;
const Hand = db.Hand;
const Promise = require('bluebird');

app.use(express.static('frontend'));
app.use(express.static('dist'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/**
 * Requires parameters playerName and gameCode.
 * returns object with property game.
 */
app.post("/api/game", function(req, res) {
	let gameCode = req.body.gameCode;
	let playerName = req.body.playerName;
	let game;
	let player;

	// playerPromise resolves to [playerModel, hasNewPlayerBeenCreated]
	let playerPromise = Player.findOrCreate({
		where: {
			username: playerName
		}
	});

	// gamePromise resolves to [gameModel, hasNewGameBeenCreated]
	let gamePromise = Game.findOrCreate({
		where: {
	    	gameCode: gameCode
	    }
	});

	// Promise.all resolves to an array of the results of playerPromise and gamePromise:
	// [
	//   [playerModel, hasNewPlayerBeenCreated],
	//   [gameModel, hasNewGameBeenCreated]
	//  ]
	// .spread will put the content of the outer array into its own argument
	// playerResult = [playerModel, hasNewPlayerBeenCreated],
	// gameResult = [gameModel, hasNewGameBeenCreated]
	return Promise.all([playerPromise, gamePromise]).spread((playerResult, gameResult) => {
		// game = gameModel
		game = gameResult[0];
		// player = playerModel
		player = playerResult[0];
		return game.addPlayer(player);
		// This promise will resolve to the result of game.addPlayer (I don't know what that is...)
		// We don't end up using it anyways, but the content goes to "results"
	}).then((results) => {
		// Here is where we determine what the API returns.
		// It will be a json object with: {game: gameModel}
		return res.json({
			game: game
		});
	});
});

app.get("/api/game/:gameId/players", (req, res) => {
	return Game.findOne({
		where: {
			id: req.params.gameId
		}
	}).then((game) => {
		return game.getPlayers();
	}).then((players) => {
		return res.json({
			players: players
		});
	});
});

app.post("/api/game/:gameId/start", (req, res) => {
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
			id: req.params.gameId
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
			gameId: req.params.gameId,
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
				gameId: req.params.gameId,
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
	}).then((result) => {
		res.json(result);
	});
});

app.get("/api/game/:gameId", (req, res) => {
	let gamePromise = Game.findOne({
		where: {
			id: req.params.gameId
		}
	});

	let playersPromise = gamePromise.then((game) => {
		return Promise.props({
			game: game,
			players: game.getPlayers()
		});
	}).then((results) => {
		return Promise.all(results.players.map((player) => {
			let hand;
			if (results.game.hasStarted) {
				hand = player.getHand();
			}
			return Promise.props({
				player: player,
				hand: hand
			});
		}));
	});

	let deckPromise = gamePromise.then((game) => {
		if (game.hasStarted) {
			return game.getDeck();
		}

		return undefined;
	});

	Promise.props({
		playerInfo: playersPromise,
		game: gamePromise,
		deck: deckPromise
	}).then((results) => {
		res.json(results);
	})
});

app.get("/*", (req, res) => {
	res.sendFile(`${__dirname}/frontend/index.html`)
});

app.listen(port, () => console.log(`Glory to Rome listening on port ${port}!`));