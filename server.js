const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const db = require('./models/index.js');
const Game = db.Game;

app.use(express.static('frontend'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post("/game", function(req, res) {
	console.log(Game);
	return Game.create({
	    gameCode: req.body.gameCode
	}).then(function(game) {
		res.json({gameCode: game.gameCode, id: game.id});
	});
})

app.listen(port, () => console.log(`Glory to Rome listening on port ${port}!`));