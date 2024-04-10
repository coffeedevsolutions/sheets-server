// sockets/game.js
const Game = require('../games/game');

io.on('connection', (socket) => {
    const game = new Game();

    socket.on('startGame', () => {
        game.start();
    });

    socket.on('makeMove', (move) => {
        game.makeMove(socket.id, move);
    });
});