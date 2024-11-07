const Board = require('./Board');
const Piece = require('./Piece');

class Components {
  constructor(board, pieces) {
    this.board = board;
    this.pieces = pieces;
  }

  static fromJson(json) {
    return new Components(
      Board.fromJson(json.field),
      json.pieces.map(piece => Piece.fromJson(piece))
    );
  }
}

module.exports = Components;
