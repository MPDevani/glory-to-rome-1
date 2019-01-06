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
	// 1. Create a deck
	// 2. Create N number of player hands
	// 3. Update number of cards for playerhands and deck
	// 4. Pick a player to go first
	// 5. Return
	//      - Deck
	//      - Playerhands
	let playersPromise = Game.findOne({
		where: {
			id: req.params.gameId
		}
	}).then((game) => {
		console.log("Game", game);
		return game.getPlayers()
	});

	let deckCreationPromise = playersPromise.then((players) => {
		return Deck.create({
			gameId: req.params.gameId,
			cardCount: 100 - (players.length * 5)
		})
	});

	let playerInfoPromises = playersPromise.then((players) => {
		console.log("Players", players);
		let handCreationPromises = players.map((player) => {
			let handPromise = Hand.create({
				gameId: req.params.gameId,
				cardCount: 5,
				playerId: player.id
			});

			return Promise.props({
				player: player,
				hand: handPromise
			});
		});
		
		return Promise.props(handCreationPromises);
	});

	return Promise.props({
		playerInfo: playerInfoPromises,
		deck: deckCreationPromise
	}).then((result) => {
		console.log("Result", result);
		res.json(result);
	});
});

app.get("/*", (req, res) => {
	res.sendFile(`${__dirname}/frontend/index.html`)
});

app.listen(port, () => console.log(`Glory to Rome listening on port ${port}!`));