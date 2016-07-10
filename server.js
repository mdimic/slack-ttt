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
	if (token != Nrkey2tmCRu5YlO6nMIFBF4P) { // Check if token matches
		// send error
	}
	else if (input[0] == "help") { // Help
		// Responce = help
	}
	else if (input[0] == "status") { // Game status
		// call game status
		// responce = status
	}
	else if (input[0] == "move") { // Make move
		// call move at position and player
		// call game status
		// responce = status
	}
	else if (input[0] == "forfeit") { // Forfeit
		// game.forfeit(player)
		//responce = game status 
	}
	else {  // Initiate game
		// game start
		//  responce = status
	}

	// game tools
	// save game
	// load game
	// determine game state

	res.json(responce);

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