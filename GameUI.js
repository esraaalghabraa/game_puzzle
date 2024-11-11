const readline = require('readline');

class GameUI {
  constructor(gameControl) {
    this.gameControl = gameControl;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async startGame() {
    if (!await this.gameControl.loadComponents()) return;
    while (this.gameControl.hasAvailablePieces()) {
      this.printBoard();
      this.printAvailablePieces();
      await this.selectPieceAndPlace();
    }
    this.printBoard();
    console.log("You have successfully solved the game.");
    this.rl.close();
  }

  async promptUser(question) {
    return new Promise(resolve => this.rl.question(question, resolve));
  }

  printBoard() {
    console.log("Current board:");
    const board = this.gameControl.getBoardValues();
    board.forEach(row => {
      console.log(row.map(val => (val === -1 ? '!' : val)).join(' '));
    });
  }

  printAvailablePieces() {
    console.log("Available Pieces:");
    const availablePieces = this.gameControl.getAvailablePieces();
    availablePieces.forEach(piece => this.printPiece(piece));
  }

  printPiece(piece) {
    const { maxX, maxY, minX, minY } = this.gameControl.getPieceBounds(piece);
    const board = Array.from({ length: maxY - minY + 1 }, () => Array(maxX - minX + 1).fill(' '));
    piece.blocks.forEach(block => {
      board[block.y - minY][block.x - minX] = `${piece.id}`;
    });
    console.log(`Piece ${piece.id}:`);
    board.forEach(row => console.log(row.join('')));
    console.log();
  }

  async selectPieceAndPlace() {
    const piece = await this.promptPieceSelection();
    if (!piece) return false;

    const { x: startX, y: startY } = await this.promptPositionSelection();
    if (this.gameControl.placePiece(piece, startX, startY)) {
      console.log("Piece added successfully");
      return true;
    } else {
      console.error("Invalid position for this piece");
      return false;
    }
  }

  async promptPieceSelection() {
    const pieceNumber = await this.promptUser("Enter the piece number you want to select (or type 'undo' to undo last move): ");

    if (pieceNumber.toLowerCase() === 'undo') {
      this.gameControl.undoMove();
      return null;
    }

    const piece = this.gameControl.findAvailablePieceById(parseInt(pieceNumber));
    if (!piece) {
      console.error("Invalid piece number. Please try again.");
      return null;
    }
    return piece;
  }

  async promptPositionSelection() {
    const x = await this.promptUser("Enter the x coordinate for the starting position: ");
    const y = await this.promptUser("Enter the y coordinate for the starting position: ");
    return { x: parseInt(x), y: parseInt(y) };
  }
}

module.exports = GameUI;
