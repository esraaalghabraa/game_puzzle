const GameControle = require('./GameControle');
const GameUI = require('./GameUI');

(async () => {
  const ui = new GameUI();
  const gameControle = new GameControle(ui);
  await gameControle.startGame();
})();
