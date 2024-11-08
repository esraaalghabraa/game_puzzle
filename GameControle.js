const Components = require('./models/Components');
const Block = require('./models/Block');
const JsonLoaders = require('./utility/jsonLoaders');

class GameControle {
  constructor(ui) {
    this.selectedPieces = [];
    this.availablePieces = [];
    this._gameComponents = null;
    this.moveHistory = [];
    this.ui = ui;
  }

  async _loadComponents() {
    try {
      const jsonData = await JsonLoaders.loadFile('field.json');
      this._gameComponents = Components.fromJson(jsonData);
      this.availablePieces = [...this._gameComponents.pieces];
      return true;
    } catch (error) {
      this.ui.printMessage("Error loading components: " + error);
      return false;
    }
  }


  printPiece(piece) {
    const { maxX, maxY, minX, minY } = this.getPieceBounds(piece);
    const board = Array.from({ length: maxY - minY + 1 }, () => Array(maxX - minX + 1).fill(' '));
    piece.blocks.forEach(block => {
      board[block.y - minY][block.x - minX] = `${piece.id}`;
    });
    this.ui.printMessage(`Piece ${piece.id}:`);
    board.forEach(row => this.ui.printMessage(row.join('')));
  }

  getPieceBounds(piece) {
    const maxX = Math.max(...piece.blocks.map(block => block.x));
    const maxY = Math.max(...piece.blocks.map(block => block.y));
    const minX = Math.min(...piece.blocks.map(block => block.x));
    const minY = Math.min(...piece.blocks.map(block => block.y));
    return { maxX, maxY, minX, minY };
  }

  async selectPieceAndPlace() {
    const pieceNumber = await this.ui.pieceSelection()
    const piece = await this.promptPieceSelection(pieceNumber);
    if (!piece) return false;

    const { x: startX, y: startY } = await this.promptPositionSelection();
    const offset = new Block(startX, startY);

    if (!this.validateOffset(piece, offset)) {
      this.ui.printMessage("Invalid position for this piece");
      return false;
    } else {
      this.saveMoveState(piece, offset);
      this.ui.printMessage("Piece added successfully");
      return true;
    }
  }

  async undoMove() {
    if (this.moveHistory.length === 0) {
      this.ui.printMessage("No moves to undo.");
      return;
    }
    this.moveHistory.pop();
    if (this.moveHistory.length === 0) {
      await this._loadComponents();
      return;
    }
    const lastMove = this.moveHistory.at(-1);
    this._gameComponents.board.values = lastMove.boardSnapshot.map(row => [...row]);
    this.availablePieces.push(lastMove.piece);
  }

  async promptPieceSelection(pieceNumber) {
    if (pieceNumber === 'undo') {
      this.undoMove();
      return null;
    }
    const piece = this.availablePieces.find(p => p.id === parseInt(pieceNumber));
    if (!piece) {
      this.ui.printMessage("Invalid piece number. Please try again.");
      return null;
    }
    return piece;
  }

  async promptPositionSelection() {
    const x = await this.ui.promptUser("Enter the x coordinate for the starting position: ");
    const y = await this.ui.promptUser("Enter the y coordinate for the starting position: ");
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
      this.ui.printBoard(this._gameComponents.board.values);
      this.ui.printAvailablePieces(this.availablePieces, piece => this.printPiece(piece));
      
      await this.selectPieceAndPlace();
    }
    this.printBoard();
    this.ui.printMessage("You have successfully solved the GameControle.");
    this.ui.close();
  }
}

module.exports = GameControle;
