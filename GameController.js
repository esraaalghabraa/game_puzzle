const Components = require('./models/Components');
const Block = require('./models/Block');
const JsonLoaders = require('./utility/jsonLoaders');

class GameController {
  constructor() {
    this.selectedPieces = [];
    this.availablePieces = [];
    this._gameComponents = null;
    this.moveHistory = [];
  }

  async loadComponents() {
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

  getBoardValues() {
    return this._gameComponents.board.values;
  }

  getAvailablePieces() {
    return this.availablePieces;
  }

  hasAvailablePieces() {
    return this.availablePieces.length > 0;
  }

  getPieceBounds(piece) {
    const maxX = Math.max(...piece.blocks.map(block => block.x));
    const maxY = Math.max(...piece.blocks.map(block => block.y));
    const minX = Math.min(...piece.blocks.map(block => block.x));
    const minY = Math.min(...piece.blocks.map(block => block.y));
    return { maxX, maxY, minX, minY };
  }

  findAvailablePieceById(pieceId) {
    return this.availablePieces.find(p => p.id === pieceId);
  }

  placePiece(piece, startX, startY) {
    const offset = new Block(startX, startY);
    if (!this.validateOffset(piece, offset)) {
      return false;
    }
    this.saveMoveState(piece, offset);
    return true;
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

  undoMove() {
    if (this.moveHistory.length === 0) {
      console.log("No moves to undo.");
      return;
    }
    this.moveHistory.pop();
    if (this.moveHistory.length === 0) {
      this.loadComponents();
      return;
    }
    const lastMove = this.moveHistory.at(-1);
    this._gameComponents.board.values = lastMove.boardSnapshot.map(row => [...row]);
    this.availablePieces.push(lastMove.piece);
  }

  saveMoveState(piece, offset) {
    const boardSnapshot = this._gameComponents.board.values.map(row => [...row]);
    this.moveHistory.push({
      boardSnapshot,
      piece,
      offset
    });
  }
}

module.exports = GameController;
