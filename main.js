const GameController = require('./GameController');
const GameUI = require('./GameUI');

(async () => {
    const gameControle = new GameController();
    const ui = new GameUI(gameControle);

    await ui.startGame();
})();
