class Board {
    constructor(width, height, values) {
      this.width = width;
      this.height = height;
      this.values = values;
    }
  
    static fromJson(json) {
      return new Board(
        json.width,
        json.height,
        json.shape.map(row => [...row])
      );
    }
  }
  
  module.exports = Board;
  