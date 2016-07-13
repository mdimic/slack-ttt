var http = require('http');
var util = require('util');
var game = require('./game');

var express = require('express');

var app = express();
var port = Number(process.env.PORT || 3000);
// var request = require('request');
var authenticationTokens = require('./authentication');


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
	if (token != authenticationTokens.slackAuth) { // Check if token matches
		res.json(game.generateError("Unauthorized request."));
	}
	else if (!input[0] || input[0] == "help") { // Help
		// Responce = help
		res.json({
			"response_type": "ephemeral",
			"attachments": [
	            {
					"title": "Tic-tac-toe commands",
	            	"text": "'/ttt start [username]' - start a game with username." +
							"\n'/ttt status' - displays current board status." +
							"\n'/ttt move [row] [column]' - mark an empty space at [row, column]. Row and column go from 0 to [Board Size]." +
					        "\n'/ttt forfeit' - forfeit the game. Any player can run this command regardless of whos turn it is." +
					        "\n'/ttt help' list all available commands.",
	            }
        	]
		});
	}
	else if (input[0] == "status") { // Game status
		game.getGameStatus(channel_name, function(gameStatus) {
			res.json(game.printGame(gameStatus));
		}, function(errorMessage) {
			res.json(game.generateError(errorMessage));
		});
	}
	else if (input[0] == "move") { // Make move
		if (input.length != 3) {
			res.json(game.generateError("Invalid input. make a move type '/ttt move [row] [column]' to mark the box at [row, column] where row and column both go from 0 to [Board Size], or type '/ttt help' for more commands"));
		}
		else {
			console.log("Called Move");
			game.move(user_name, channel_name, input[1], input[2], function(returnGame) {
				console.log("Returned move");
				res.json(game.printGame(returnGame));
			}, function(errorMessage) {
				res.json(game.generateError(errorMessage));
			});
		}

	}
	else if (input[0] == "forfeit") { // Forfeit
		if (input.length == 1) {
			game.forfeit(channel_name, user_name, function(forfeitGame) {
				res.json(game.printGame(forfeitGame));
			}, function(errorMessage) {
				res.json(game.generateError(errorMessage));
			});
		}
		else {
			res.json(game.generateError("Invalid input. To forfeit a game, type '/ttt forfeit'. You must be a player in the current game to forfeit, or type '/ttt help' for more commands"));
		}
	}
	else if (input[0] == "start") {  // Initiate game
		if (input.length > 3) {
			res.json(game.generateError("Invalid input. To initiate a game type '/ttt start [Username]' to play a game against username, or type '/ttt help' for more commands"));
		}
		else {
			var boardSize = 3;
			if (input.length == 3)
				boardSize = input[2];

			// if (userInChannel(input[0])) {
				game.startGame(channel_name, user_name, input[1], boardSize, function(newGame) {
					res.json(game.printGame(newGame));	
				}, function(errorMessage) {
					res.json(game.generateError(errorMessage));
				});
			// }
			// else {
			// 	res.json(game.generateError("That player is not in this channel."));
			// }
		}

	}
	else {
		res.json(game.generateError("Invalid input. Type '/ttt help' for more commands"));
	}
});
app.listen(port);

// function userInChannel(userid, channel_id) {
// 	request("https://slack.com/api/channels.info?token=" + authenticationTokens.slackToken + "&channel=" + channel_id, function (error, response, body) {
// 	  if (!error) {
// 	  	var members = JSON.parse(body).channel.members;
// 	  	if (members.indexOf(userid) > -1)
// 			console.log("Contains");
// 	  }
// 	});
// }
