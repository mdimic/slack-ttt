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
		// send error
	}
	else if (input[0] == "help") { // Help
		// Responce = help
	}
	else if (input[0] == "status") { // Game status
		// call game status
		// responce = status
		game.getGameStatus();
	}
	else if (input[0] == "move") { // Make move
		if (input.length != 3) {
			// Invalid move - /move 1 2

		}

		var updatedGame = game.move(user_name, channel_name, input[1], input[2]);
		console.log("updated game");
		console.log(updatedGame);
		req.json(game.getGameStatus(updatedGame));

		// call move at position and player
		// call game status
		// responce = status
	}
	else if (input[0] == "forfeit") { // Forfeit
		var forfeitGame = game.forfeit(channel_name, user_name);
		req.json(game.getGameStatus(forfeitGame));		

		//responce = game status 
	}
	else {  // Initiate game
		// game start
		if (input.length > 2) {
			// Error
		}

		var boardSize = 3;
		if (input.length == 2)
			boardSize = input[1];

		var newGame = game.startGame(channel_name, user_name, input[0], boardSize);
		res.json(game.getGameStatus(newGame));

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