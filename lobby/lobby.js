// lobby/lobby.js
const Game = require('../games/game');

class Lobby {
    constructor() {
        this.games = new Map();
    }

    createGame() {
        const accessCode = this.generateAccessCode();
        const game = new Game();
        this.games.set(accessCode, game);
        return accessCode;
    }

    addPlayer(accessCode, player) {
        const game = this.games.get(accessCode);
        if (game) {
            game.addPlayer(player);
        }
    }

    getGame(accessCode) {
        return this.games.get(accessCode);
    }

    generateAccessCode() {
        // Generate a unique access code
        // This is a simple implementation and might not be unique
        return Math.random().toString(36).substring(2, 8);
    }

    joinGame(accessCode) {
        if (this.games.has(accessCode)) {
            const game = this.games.get(accessCode);
            // Add the player to the game and return true
            // ...
            return true;
        } else {
            // The game does not exist
            return false;
        }
    }
}

module.exports = Lobby;