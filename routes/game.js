// routes/game.js
const express = require('express');
const router = express.Router();
const Game = require('../games/game');

const game = new Game();

router.post('/start', (req, res) => {
    const gameStatus = game.start();
    res.send(gameStatus);
});

router.post('/move', (req, res) => {
    const move = req.body.move;
    game.makeMove(req.body.player, move);
    res.send('Move made');
});

module.exports = router;