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
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const gameLib = require('./lib/game.js').getInstance(db);
app.use(cookieParser());
app.use(session({secret: 'lalalala'}));
app.use(passport.initialize());
app.use(passport.session());

const isLoggedIn = (req, res, next) => {
	if (req.user) {
		return next();
	} else {
		res.cookie('redirect_url', req.path);
		res.redirect('/login');
	}
};

app.get('/login', (req, res) => {
	if (req.user) {
		let path = req.cookies.redirect_url || '/';
		res.redirect(path);
	}

	res.sendFile(`${__dirname}/frontend/login.html`)
})

passport.use(new GoogleStrategy({
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	    callbackURL: "http://localhost:3000/auth/google/callback"
	},
	function(accessToken, refreshToken, profile, done) {
		console.log("hello");
		Player.findOrCreate({where: {
			username: profile.id
		}}).then((playerInfo) => {
			return done(null, playerInfo[0]);
		})
}));

passport.serializeUser((player, done) => {
	done(null, player.id);
});

passport.deserializeUser((id, done) => {
	Player.findById(id).then((player) => {
		done(null, player);
	});
});

app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/login");
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    let path = req.cookies.redirect_url || '/';
	res.redirect(path);
  });

// app.use(express.static('frontend'));
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
	let gameId = req.params.gameId;

	gameLib.startGame(gameId).then((results) => {
		console.log(results.game);
		console.log(results.playerInfo);
		console.log(results.playerInfo[0].player);
		console.log(results.playerInfo[0].hand);
		console.log(results.deck);
		res.json(results);
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

app.get("/*", isLoggedIn, (req, res) => {
	res.sendFile(`${__dirname}/frontend/index.html`)
});

app.listen(port, () => console.log(`Glory to Rome listening on port ${port}!`));

/*

Login path:
if you're not logged in and you go to /game/4
1. app.get('/*'...) is the matching route
2. isLoggedIn runs before res.sendFile
3. isLoggedIn sees that you're not logged in
4. isLoggedIn stores the path you're going to in a cookie
5. isLoggedIn redirects you to /login
6. /login returns HTML page with a button to login through Google
7. User clicks on the button which redirects to /auth/google
8. /auth/google uses passport to login via Google.
8b. Passport passes info to Google that redirect to /auth/google/callback when its complete.
9. From /auth/google/callback, we check the cookies for a redirect_url and retrieve /game/4
10. We redirect to /game/4
11. isLoggedIn runs and sees we're logged in.
12. isLoggedIn calls next() to let the regular action happen which is res.sendFile(...index.html)
13. The frontend component sees the path /game/4 and uses the Switch to show proper page.

*/