const Block = require('./Block');

class Piece {
  constructor(id, blocks) {
    this.id = id;
    this.blocks = blocks.map(block => new Block(block.x, block.y));
  }

  static fromJson(json) {
    return new Piece(
      json.id,
      json.blocks.map(block => new Block(block[0], block[1]))
    );
  }
}

module.exports = Piece;
