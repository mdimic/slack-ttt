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
    console.log("game Status");

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
      "response_type": "in_channel",
      "text": text,
        "attachments": [
            {
                "text": printBoard(game.board)
            }
        ]
    };
console.log("response: " + response);
    return response;
  },
  move: function (user_name, channel_name, row, col, successCallback, errorHandler) {
    loadGame(channel_name, function(game) {
      console.log(row);
      console.log(col);

      if (game.state != gameStatus.INPROGRESS) {
        errorHandler("You can only make a move in a game still in progress.");
      }
      else if (game.currentPlayer != user_name) {
        errorHandler("It is not your turn. It is currently " + game.currentPlayer + "'s turn.");
      }
      else if (row < 0 || col < 0 || row > game.boardSize || col > game.boardSize) {
        errorHandler("Entered area was out of bounds.");
      }
      else if (game.board[row][col] != 0) {
        errorHandler("That area is already marked.");
      }
      else {
        //Check invalid position

        if (user_name == game.player1)
          game.board[row][col] = 1;
        else if (user_name == game.player2)
          game.board[row][col] = -1;


        // check if game won
        var winner = detectWinner(game.board);
        if (winner == 1)
          game.state = gameStatus.GAMEOVERP1WON;
        else if (winner == -1)
          game.state = gameStatus.GAMEOVERP2WON;

        // Change player
        if (game.currentPlayer == game.player1)
          game.currentPlayer = game.player2;
        else
          game.currentPlayer = game.player1;


        storeGame(game);

        // return getGameStatus(game);
        // return game;
        console.log("Callback with: " + game);

        successCallback(game);
      }


    }, function(error) {
      errorHandler(error);
    });
  },
  forfeit: function (channel_name, user_name, successCallback, errorHandler) {
    loadGame(channel_name, function(game) {
      if (game.state != gameStatus.INPROGRESS) {
        errorHandler("You can only forfeit a game still in progress.");
      }

      if (user_name == game.player1)
        game.state = gameStatus.GAMEOVERP1FORFEIT;
      else
        game.state = gameStatus.GAMEOVERP2FORFEIT;


      storeGame(game);

      // return getGameStatus(game);
      // return game;
      successCallback(game);

    }, function(error){
      errorHandler(error);
    });
  },
  generateError: function (errorMessaage) {
    var response = {
      "response_type": "ephemeral",
      "text": "Error:",
        "attachments": [
            {
                "text": errorMessaage
            }
        ]
    };

    return response;
  },
  startGame: function (channel_name, player1, player2, boardSize, successCallback, errorHandler) {
    // If game exists in chanel, error
    // Start new game if old one is done
    loadGame(channel_name, function(game) {
      if (game.state != gameStatus.INPROGRESS) {
        var newGame = createGame(channel_name, player1, player2, boardSize);
        successCallback(newGame);
      }
      else {
        errorHandler("Please finish the current game in the channel before creating a new one.");        
      }


    }, function(error){
        var newGame = createGame(channel_name, player1, player2, boardSize);
        successCallback(newGame);
    });


    // callback(gameStatus(game));

  }
};

function createGame (channel_name, player1, player2, boardSize) {
  var game = {
    channel_name: channel_name,
    board: initBoard(boardSize),
    state: gameStatus.INPROGRESS,
    boardSize: boardSize,
    player1: player1,
    player2: player2,
    currentPlayer: player1
  };
  storeGame(game);
  return game;
};

function loadGame (channel_name, successCallback, errorCallback) {
  // reddit.get('channel_name', function (err, value) {
  //   if (value) {
  //     successCallback(value);
  //   }
  // });

  client.get(channel_name, function (err, reply) {
    if (reply != null) {
      // res.send(reply);
      console.log("Reply:" + reply);
      console.log("Err: " + err);
      successCallback(JSON.parse(reply));
    } else {
      errorCallback(err);
    }
  });

};

function storeGame (game) {
  console.log("storing");
  console.log(JSON.stringify(game));
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
  // console.log(board);
  return board;
}

// "text": "|       |       |  O  |\n----------------\n|       |       |  O  |\n----------------\n|  X  |  X  |  X  |"

function printBoard (board) {
  // console.log(board);
  var boardString = "";
  for (var i = 0; i < board.length; i++) {
    boardString = boardString + "|";
    for (var j = 0; j < board.length; j++) {
      switch(board[i][j]) {
          case 0:
              boardString = boardString + "       |";
              break;
          case 1:
              boardString = boardString + "  X  |";
              break;
          case -1:
              boardString = boardString + "  O  |";
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

function detectWinner (board) {
  var horizSum = new Array();
  var diagSum1 = 0;
  var diagSum2 = 0;
  var vertSum = new Array();
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      var val = board[i][j];
      if (i == j) {
        diagSum1 += val;
      }
      else if (i = board.length - j - 1) {
        diagSum2 += val;
      }

      horizSum[j] += val;
      vertSum[i] += val;
    }
  };

  if (diagSum1 == board.length || diagSum2 == board.length)
    return 1;
  else if (diagSum1*(-1) == board.length || diagSum2*(-1) == board.length)
    return -1;

  for (var k = 0; k < board.length; k++) {
    if (horizSum[k] == board.length || vertSum[k] == board.length)
      return 1;
    if (horizSum[k]*(-1) == board.length || vertSum[k]*(-1) == board.length)
      return -1;
  }

  return 0;

}