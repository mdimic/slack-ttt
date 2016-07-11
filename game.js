var gameStatus = require('./gameStatus');
// var REDIS_URL = "redis://h:pfds3h5en5ce3b6p6be6sb9i203@ec2-54-243-230-243compute-1.amazonaws.com:24599";
// var client = require('redis').createClient(process.env.REDIS_URL);

// var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);
// var client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});

// client.set("welcome_msg", "Hello from Redis!")

// client.get("welcome_msg", function (err, reply) {
//   if (reply != null) {
//     res.send(reply);
//   } else {
//     res.send("Error");
//   }
// });
module.exports = {
  getGameStatus: function (game) {


    var text = "";
    switch(game.state) {
        case gameStatus.INPROGRESS:
              text = "Game currently in progress.\nIt's " + game.currentPlayer + "'s turn.";
            break;
        case gameStatus.GAMEOVERP1WON:
              text = "Game over. \n" + game.player1 + " won!";
            break;
        case gameStatus.GAMEOVERP2WON:
              text = "Game over. \n" + game.player2 + " won!";
            break;
        case gameStatus.GAMEOVERDRAW:
              text = "Game over. \nIt's a tie!";
            break;
        case gameStatus.GAMEOVERP1FORFEIT:
              text = "Game over. \n" + game.player1 + " forfeited";
            break;
        case gameStatus.GAMEOVERP2FORFEIT:
              text = "Game over. \n" + game.player2 + " forfeited";
            break;
    }

    var response = {
      "text": text,
        "attachments": [
            {
                "text": printBoard(game.board)
            }
        ]
    };

    return response;
  },
  move: function (user_name, channel_name, row, col) {
    loadGame(channel_name, function(game) {
      console.log(row);
      console.log(col);
      if (game.state != gameStatus.INPROGRESS) {
        // Error
      }

      if (game.currentPlayer != user_name) {
        // Error
      }

      if (game.board[row][col] != 0) {
        // Error - Invalid move
      }

      if (user_name == game.player1)
        game.board[row][col] = 1;
      else if (user_name == game.player2)
        game.board[row][col] = -1;


      // check if game won

      // Change player
      if (game.currentPlayer == player1)
        game.currentPlayer = player2;
      else
        game.currentPlayer = player1;


      storeGame(game);

      return getGameStatus(game);

    });
  },
  forfeit: function () {

  },
  startGame: function (channel_name, player1, player2, boardSize) {
    // If game exists in chanel, error
    // Start new game if old one is done

    var game = {
      channel_name: channel_name,
      board: initBoard(boardSize),
      state: gameStatus.INPROGRESS,
      boardSize: boardSize,
      player1: player1,
      player2: player2,
      currentPlayer: player1
    };

    //Save game
    storeGame(game);

    return game;

    // callback(gameStatus(game));

  }
};

function loadGame (channel_name, successCallback) {
  // reddit.get('channel_name', function (err, value) {
  //   if (value) {
  //     successCallback(value);
  //   }
  // });

  client.get(channel_name, function (err, reply) {
    if (reply != null) {
      // res.send(reply);
      console.log("Reply:");
      console.log(reply);
      successCallback(reply);
    } else {
      // res.send("Error");
      //Error
    }
  });

};

function storeGame (game) {
  client.set(game.channel_name, JSON.stringify(game));
  // redis.set(game.channel_name, JSON.stringify(game));
};

function initBoard (boardSize) {
  var board = new Array();

  for (var i = 0; i < boardSize; i++) {
    board[i] = new Array();
    for (var j = 0; j < boardSize; j++) {
      board[i][j] = 0;
    };
  };
  console.log(board);
  return board;
}

// "text": "|       |       |  O  |\n----------------\n|       |       |  O  |\n----------------\n|  X  |  X  |  X  |"

function printBoard (board) {
  console.log(board);
  var boardString = "";
  for (var i = 0; i < board.length; i++) {
    boardString = boardString + "|";
    for (var j = 0; j < board.length; j++) {
      switch(board[i][j]) {
          case 0:
              boardString = boardString + "       |";
              break;
          case 1:
              boardString = boardString + "  O  |";
              break;
          case -1:
              boardString = boardString + "  X  |";
              break;
      }
    };
    boardString = boardString + "\n";

    if (i < board.length - 1) {
      for (var k = 0; k < board.length; k++) {
        boardString = boardString + "-----";
      };
      boardString = boardString + "\n";
    }
  };

  return boardString;
}