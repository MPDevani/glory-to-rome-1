const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const db = require('./models/index.js');
const Game = db.Game;
const Player = db.Player;
const Promise = require('bluebird');

app.use(express.static('frontend'));
app.use(express.static('dist'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

/**
 * Requires parameters playerName and gameCode.
 * returns object with property game.
 */
app.post("/game", function(req, res) {
	let gameCode = req.body.gameCode;
	let playerName = req.body.playerName;
	let game;
	let player;

	let playerPromise = Player.findOrCreate({
		where: {
			username: playerName
		}
	});

	let gamePromise = Game.findOrCreate({
		where: {
	    	gameCode: gameCode
	    }
	});

	return Promise.all([playerPromise, gamePromise]).spread((playerResult, gameResult) => {
		game = gameResult[0];
		player = playerResult[0];
		return game.addPlayer(player);
	}).then((results) => {
		return res.json({
			game: game
		});
	});
});

app.get("/game/:gameId/players", (req, res) => {
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

app.get("/*", (req, res) => {
	res.sendFile(`${__dirname}/frontend/index.html`)
});

app.listen(port, () => console.log(`Glory to Rome listening on port ${port}!`));