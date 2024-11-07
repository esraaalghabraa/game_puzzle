const GameControle = require('./GameControle');

(async () => {
  const gameControle = new GameControle();
  await gameControle.startGame();
})();
