var gameStatus = require('./gameStatus');
var redis = require('redis');
var url = require('url');
var redisURL = url.parse(process.env.REDISCLOUD_URL);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);


module.exports = {
  printGame: function (game) {

    var text = "";
    var color = "";

    // Generate response
    switch(game.state) {
        case gameStatus.INPROGRESS:
              text = "Game currently in progress.\nIt's " + game.currentPlayer + "'s turn.";
              color = "#0000ff";
            break;
        case gameStatus.GAMEOVERP1WON:
              text = "Game over. \n" + game.player1 + " won!";
              color = "good";
            break;
        case gameStatus.GAMEOVERP2WON:
              text = "Game over. \n" + game.player2 + " won!";
              color = "good";
            break;
        case gameStatus.GAMEOVERDRAW:
              text = "Game over. \nIt's a tie!";
              color = "warning";
            break;
        case gameStatus.GAMEOVERP1FORFEIT:
              text = "Game over. \n" + game.player1 + " forfeited";
              color = "warning";
            break;
        case gameStatus.GAMEOVERP2FORFEIT:
              text = "Game over. \n" + game.player2 + " forfeited";
              color = "warning";
            break;
        default:
              console.log("Error with game state");
    }

    var response = {
      "response_type": "in_channel",
      "text": text,
        "attachments": [
            {
                "text": printBoard(game.board),
                "color": color,
            }
        ]
    };

    return response;
  },
  move: function (user_name, channel_name, row, col, successCallback, errorHandler) {
    loadGame(channel_name, function(game) {

      // Check for errors
      if (game.state != gameStatus.INPROGRESS) {
        errorHandler("You can only make a move in a game still in progress.");
      }
      else if (game.currentPlayer != user_name) {
        errorHandler("It is not your turn. It is currently " + game.currentPlayer + "'s turn.");
      }
      else if (row < 0 || col < 0 || row > game.boardSize - 1 || col > game.boardSize - 1) {
        errorHandler("Entered area was out of bounds.");
      }
      else if (game.board[row][col] != 0) {
        errorHandler("That area is already marked.");
      }
      else { // Valid input

        // Mark board
        if (user_name == game.player1)
          game.board[row][col] = 1;
        else if (user_name == game.player2)
          game.board[row][col] = -1;

        // check if someone won
        var winner = detectWinner(game.board);
        if (winner == 1) // Player 1 won
          game.state = gameStatus.GAMEOVERP1WON;
        else if (winner == -1) // Player 2 won
          game.state = gameStatus.GAMEOVERP2WON;
        else if (winner == 2) // Draw
          game.state = gameStatus.GAMEOVERDRAW;

        // Update player
        if (game.currentPlayer == game.player1)
          game.currentPlayer = game.player2;
        else
          game.currentPlayer = game.player1;

        storeGame(game);

        successCallback(game);
      }


    }, function(error) {
      errorHandler(error);
    });
  },
  forfeit: function (channel_name, user_name, successCallback, errorHandler) {
    loadGame(channel_name, function(game) {

      // Check for errors
      if (game.state != gameStatus.INPROGRESS) {
        errorHandler("You can only forfeit a game still in progress.");
      }
      else if (user_name == game.player1)
        game.state = gameStatus.GAMEOVERP1FORFEIT;
      else if (user_name == game.player2)
        game.state = gameStatus.GAMEOVERP2FORFEIT;
      else
       errorHandler("You can only forfeit a game that you are a part of."); 

      storeGame(game);

      successCallback(game);

    }, function(error){
      errorHandler(error);
    });
  },
  getGameStatus: function (channel_name, successCallback, errorHandler) {
    loadGame(channel_name, function(game) {
      successCallback(game);
    }, function(error){
      errorHandler("There is currently no game in progress. To start a game, type '/ttt user' where user is the username of who you want to challenge.");
    });
  },
  generateError: function (errorMessaage) {
    var response = {
      "response_type": "ephemeral",
        "attachments": [
            {
                "text": errorMessaage,
                "color": "danger",
            }
        ]
    };
    return response;

  },
  startGame: function (channel_name, player1, player2, boardSize, successCallback, errorHandler) {
    
    if (player1 == player2) {
      errorHandler("You can't start a game against yourself");
    }
    else {
        loadGame(channel_name, function(game) {
          
        // Start new game if current game in progress
        if (game.state == gameStatus.INPROGRESS) {
          errorHandler("Please finish the current game in the channel before creating a new one.");
        }
        else {
          var newGame = createGame(channel_name, player1, player2, boardSize);
          successCallback(newGame);        
        }
      }, function(error){ // No game in progress
          var newGame = createGame(channel_name, player1, player2, boardSize);
          successCallback(newGame);
      }); 
    }

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
    currentPlayer: player1,
  };

  storeGame(game);

  return game;
};

function loadGame (channel_name, successCallback, errorCallback) {
  client.get(channel_name, function (err, reply) {
    if (reply != null) {
      successCallback(JSON.parse(reply));
    } else {
      errorCallback(err);
    }
  });
};

function storeGame (game) {
  client.set(game.channel_name, JSON.stringify(game));
};

function initBoard (boardSize) {
  var board = new Array();

  for (var i = 0; i < boardSize; i++) {
    board[i] = new Array();
    for (var j = 0; j < boardSize; j++) {
      board[i][j] = 0;
    };
  };
  return board;
}

// "text": "|       |       |  O  |\n----------------\n|       |       |  O  |\n----------------\n|  X  |  X  |  X  |"

function printBoard (board) {
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
          default:
              boardString = boardString + "       |";
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
  var horizSum = new Array(board.length).fill(0);
  var diagSum1 = 0;
  var diagSum2 = 0;
  var vertSum = new Array(board.length).fill(0);
  var markCounter = 0;

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      var val = board[i][j];
      if (i == j) {
        diagSum1 += val;
      }
      if (i == board.length - j - 1) {
        diagSum2 += val;
      }

      horizSum[j] += val;
      vertSum[i] += val;

      if (val != 0)
        markCounter++;
    }
  }

  // Check for winner
  if (diagSum1 == board.length || diagSum2 == board.length)
    return 1;
  else if (diagSum1*(-1) == board.length || diagSum2*(-1) == board.length)
    return -1;
  
  for (var k = 0; k < board.length; k++) {
    if (horizSum[k] == board.length || vertSum[k] == board.length)
      return 1;
    if (horizSum[k]*(-1) == board.length || vertSum[k]*(-1) == board.length)
      return -1;
  };

  // No winner, check for tie
  if (markCounter == board.length * board.length)
    return 2; // Tie
  else
    return 0;  // No winner or tie

};
