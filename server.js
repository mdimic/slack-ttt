var http = require('http');
var util = require('util');
var game = require('./game');

var express = require('express');

var app = express();
var port = Number(process.env.PORT || 3000);


app.get('/', function (req, res) {
	const token = req.query.token;
	const team_id = req.query.team_id;
	const channel_id = req.query.channel_id;
	const channel_name = req.query.channel_name;
	const user_id = req.query.user_id;
	const user_name = req.query.user_name;
	const command = req.query.command;
	const text = req.query.text;
	const response_url = req.query.response_url;


	var responce = {};
	var input = text.split(" ");
	
	// Handle input
	if (token != "Nrkey2tmCRu5YlO6nMIFBF4P") { // Check if token matches
		res.json(game.generateError("Unauthorized request."));
	}
	else if (input[0] == "help") { // Help
		// Responce = help
	}
	else if (input[0] == "status") { // Game status
		// load game
		// not started, or status=...
		game.getGameStatus();
	}
	else if (input[0] == "move") { // Make move
		if (input.length != 3) {
			res.json(game.generateError("Invalid input. make a move type '/ttt move X Y' where X and Y are column and row respectively, or type '/ttt help' for more commands"));
		}
		else {
			console.log("Called Move");
			game.move(user_name, channel_name, input[1], input[2], function(returnGame) {
				console.log("Returned move");
				res.json(game.getGameStatus(returnGame));
			}, function(errorMessage) {
				res.json(game.generateError(errorMessage));
			});
		}

	}
	else if (input[0] == "forfeit") { // Forfeit
		game.forfeit(channel_name, user_name, function(forfeitGame) {
			res.json(game.getGameStatus(forfeitGame));
		}, function(errorMessage) {
			res.json(game.generateError(errorMessage));
		});

		//responce = game status 
	}
	else {  // Initiate game
		// game start
		if (input.length > 2) {
			res.json(game.generateError("Invalid input. To initiate a game type '/ttt USER' where USER is the person you want to challenge, or type '/ttt help' for more commands"));
		}
		else {
			var boardSize = 3;
			if (input.length == 2)
				boardSize = input[1];

			game.startGame(channel_name, user_name, input[0], boardSize, function(newGame) {
				res.json(game.getGameStatus(newGame));	
			}, function(errorMessage) {
				res.json(game.generateError(errorMessage));
			});
			// res.json(game.getGameStatus(newGame));
		}

		//  responce = status
	}

	// game tools
	// save game
	// load game
	// determine game state

	// res.json(responce);

	// Authenticate token

	// var resp = '${test}, ${team_id}, ${channel_id}, ${channel_name}, ${user_id}, ${user_name}, ${command}, ${text}, ${response_url}';
	// res.json({
	// 	"text": "input: " + token + ", " + team_id + ", " + channel_id + ", "+ channel_name + ", " + user_id + ", " + user_name+ ", " + command + ", " + text + ", " + response_url,
	// 	"attachments": {
	// 		"text": "TEST"
	// 	}
	// });
});
app.listen(port);