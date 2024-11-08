const readline = require('readline');

class GameUI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  promptUser(question) {
    return new Promise(resolve => this.rl.question(question, resolve));
  }

  async pieceSelection() {
    const pieceNumber = await this.promptUser("Enter the piece number you want to select (or type 'undo' to undo last move): ");
    return pieceNumber;
  }

  printBoard(board) {
    console.log("Current board:");
    board.forEach(row => {
      console.log(row.map(val => (val === -1 ? '!' : val)).join(' '));
    });
  }

  printAvailablePieces(pieces, printPieceCallback) {
    console.log("Available Pieces:");
    pieces.forEach(printPieceCallback);
  }

  printMessage(message) {
    console.log(message);
  }

  close() {
    this.rl.close();
  }
}

module.exports = GameUI;
