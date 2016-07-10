var gameStatus = require('./gameStatus');

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
  move: function () {

  },
  forfeit: function () {

  },
  startGame: function (channel_name, player1, player2, boardSize) {
    // If game exists in chanel, error
    // Start new game if old one is done

    var game = {
      board: initBoard(boardSize),
      state: gameStatus.INPROGRESS,
      boardSize: boardSize,
      player1: player1,
      player2: player2,
      currentPlayer: player1
    };

    //Save game


    return game;

    // callback(gameStatus(game));

  }
};

function loadGame () {

};

function storeGame () {

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