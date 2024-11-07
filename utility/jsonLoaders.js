const fs = require('fs').promises;
const path = require('path');

class JsonLoaders {
  static async loadFile(filename) {
    try {
      const filePath = path.join(__dirname, '../assets', filename);
      const fileData = await fs.readFile(filePath, 'utf8');

      return JSON.parse(fileData);
    } catch (error) {
      console.error("Error reading JSON file:", error);
      throw error;
    }
  }
}

module.exports = JsonLoaders;
