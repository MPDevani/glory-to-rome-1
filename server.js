const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const db = require('./models/index.js');
const Game = db.Game;
const Player = db.Player;
const Promise = require('bluebird');

app.use(express.static('frontend'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post("/game", function(req, res) {
	let gameCode = req.body.gameCode;
	let playerName = req.body.playerName;

	let playerPromise = Player.findOrCreate({
		where: {
			username: playerName
		}
	}).spread(function(player, created) {
		return {
			username: player.username,
			playerId: player.id,
			playerCreated: created
		};
	});

	let gamePromise = Game.findOrCreate({
		where: {
	    	gameCode: gameCode
	    }
	}).spread(function(game, created) {
		return {
			gameCode: game.gameCode,
			gameId: game.id,
			gameCreated: created
		};
	});

	return Promise.all([playerPromise, gamePromise]).spread(function(playerResult, gameResult) {
		return res.json({
			player: playerResult,
			game: gameResult
		});
	});
})

app.listen(port, () => console.log(`Glory to Rome listening on port ${port}!`));