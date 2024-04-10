// server.js
class Deck {
    constructor() {
        this.cards = [];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suits = ['C', 'D', 'H', 'S'];
        for (const rank of ranks) {
            for (const suit of suits) {
                this.cards.push(rank + suit);
            }
        }
        this.shuffle(); // Shuffle the deck
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
}

module.exports = Deck;