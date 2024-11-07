const Components = require('./models/Components');
const Block = require('./models/Block');
const JsonLoaders = require('./utility/jsonLoaders');
const readline = require('readline');
  
class GameControle {
  constructor() {
    this.selectedPieces = [];
    this.availablePieces = [];
    this._gameComponents = null;
    this.moveHistory = [];
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async _loadComponents() {
    try {
      const jsonData = await JsonLoaders.loadFile('field.json');
      this._gameComponents = Components.fromJson(jsonData);
      this.availablePieces = [...this._gameComponents.pieces];
      return true;
    } catch (error) {
      console.error("Error loading components:", error);
      return false;
    }
  }

  printBoard() {
    console.log("Current board:");
    this._gameComponents.board.values.forEach(row => {
      console.log(row.map(val => (val === -1 ? '!' : val)).join(' '));
    });
  }

  printAvailablePieces() {
    console.log("Available Pieces:");
    for (const piece of this.availablePieces) {
      this.printPiece(piece);
    }
  }

  printPiece(piece) {
    const { maxX, maxY, minX, minY } = this.getPieceBounds(piece);

    const board = Array.from({ length: maxY - minY + 1 }, () => Array(maxX - minX + 1).fill(' '));

    piece.blocks.forEach(block => {
      board[block.y - minY][block.x - minX] = `${piece.id}`;
    });

    console.log(`Piece ${piece.id}:`);
    board.forEach(row => console.log(row.join('')));
    console.log();
  }

  getPieceBounds(piece) {
    const maxX = Math.max(...piece.blocks.map(block => block.x));
    const maxY = Math.max(...piece.blocks.map(block => block.y));
    const minX = Math.min(...piece.blocks.map(block => block.x));
    const minY = Math.min(...piece.blocks.map(block => block.y));
    return { maxX, maxY, minX, minY };
  }

  async selectPieceAndPlace() {
    const piece = await this.promptPieceSelection();
    if (!piece) return false;

    const { x: startX, y: startY } = await this.promptPositionSelection();
    const offset = new Block(startX, startY);

    if (!this.validateOffset(piece, offset)) {
      console.error("Invalid position for this piece");
      return false;
    } else {
      this.saveMoveState(piece, offset);
      console.log("Piece added successfully");
      return true;
    }
  }
  
  async undoMove() {
    if (this.moveHistory.length === 0) {
      console.log("No moves to undo.");
      return;
    }
    this.moveHistory.pop();
    if (this.moveHistory.length === 0) {
      await this._loadComponents()
      return;
    }
    const lastMove = this.moveHistory.at(-1);
      console.log(lastMove)
      this._gameComponents.board.values = lastMove.boardSnapshot.map(row => [...row]);

      this.availablePieces.push(lastMove.piece);
  }


  async promptPieceSelection() {
    const pieceNumber = await this.promptUser("Enter the piece number you want to select (or type 'undo' to undo last move): ");

    if (pieceNumber.toLowerCase() === 'undo') {
      this.undoMove();
      return null;
    }
    
    const piece = this.availablePieces.find(p => p.id === parseInt(pieceNumber));

    if (!piece) {
      console.error("Invalid piece number. Please try again.");
      return null;
    }
    return piece;
  }

  async promptUser(question) {
    return new Promise(resolve => this.rl.question(question, resolve));
  }

  async promptPositionSelection() {
    const x = await this.promptUser("Enter the x coordinate for the starting position: ");
    const y = await this.promptUser("Enter the y coordinate for the starting position: ");
    return { x: parseInt(x), y: parseInt(y) };
  }


  validateOffset(piece, offset) {
    for (const block of piece.blocks) {
      const newY = block.y + offset.y;
      const newX = block.x + offset.x;
      if (
        newY < 0 ||
        newX < 0 ||
        newY >= this._gameComponents.board.width ||
        newX >= this._gameComponents.board.height ||
        this._gameComponents.board.values[newY][newX] !== 0
      ) {
        return false;
      }
    }

    piece.blocks.forEach(block => {
      const newY = block.y + offset.y;
      const newX = block.x + offset.x;
      this._gameComponents.board.values[newY][newX] = piece.id;
    });

    this.selectedPieces.push(piece);
    this.availablePieces = this.availablePieces.filter(p => p.id !== piece.id);
    return true;
  }

  saveMoveState(piece, offset) {
    const boardSnapshot = this._gameComponents.board.values.map(row => [...row]);
    this.moveHistory.push({
      boardSnapshot,
      piece,
      offset
    });
  }

  async startGame() {
    if (!await this._loadComponents()) return;
    while (this.availablePieces.length > 0) {
      this.printBoard();
      this.printAvailablePieces();
      await this.selectPieceAndPlace();
    }
    this.printBoard();
    console.log("You have successfully solved the GameControle.");

    this.rl.close();
  }
}



module.exports = GameControle;
