const Deck = require('./deck.js');

class GameLogic {
    constructor() {
        this.deck = new Deck(); // Create a new deck
        this.deck.shuffle(); // Shuffle the deck
        this.currentCards = [];
        this.cardsDrawn = 0;
        this.cards = [];
    }

    discardCards() {
        this.currentCards = [];
    }

    placeBet(currentPlayer, players) {
        if (!players) {
            throw new Error('Players array is null or undefined');
        }
        this.betPlaced = true; // Set betPlaced to true before drawing a card
        // Draw a card when a bet is placed
        const result = this.drawCards(currentPlayer, players);
        if (result.error) {
            throw new Error(result.error);
        }
        const cards = result.cards;
        return cards;
    }
    
    bet(currentPlayer, players, initialCards, aceValue) {
        if (!players) {
            throw new Error('Players array is null or undefined');
        }
    
        // Initialize the cards array with the initial cards if it's not already initialized
        if (!this.cards || this.cards.length === 0) {
            this.cards = [...initialCards];
        }
    
        // Set betPlaced to true before drawing the third card
        this.betPlaced = true;
    
        // Draw the third card when a bet is made
        const result = this.drawCards(currentPlayer, players);
        console.log('drawCards result:', result); // Log the result of drawCards
    
        if (result.error) {
            throw new Error(result.error);
        }
    
        const thirdCard = result.cards[0];
        console.log('Drawn card:', thirdCard); // Log the drawn card
    
        if (!thirdCard) {
            throw new Error('No card was drawn');
        }
    
        this.cards.push(thirdCard); // Add the third card to the cards array
        console.log('Cards after drawing third card:', this.cards); // Log the cards array after drawing the third card
        console.log('Number of cards after drawing third card:', this.cards.length); // Log the number of cards after drawing the third card
    
        // Check if the player has won
        console.log('Number of cards before checking win:', this.cards.length); // Log the number of cards before checking win
        const winResult = this.checkWin(this.cards, aceValue);
        console.log('Win result:', winResult); // Log the result of checkWin

        // Reset betPlaced to false after the bet is completed
        this.betPlaced = false;

        this.cards = [];
    
        return { result: winResult, thirdCard };
    }

    drawCards(currentPlayer, players) {
        // If the first card is an Ace and its value hasn't been decided yet, return
        if (this.cards.length === 1 && this.cards[0] === 'A' && this.aceValue === null) {
            return;
        }
        if (!Array.isArray(players)) {
            throw new Error('Players is not an array');
        }
        console.log('players:', players);        
        console.log('currentPlayer:', currentPlayer);
        let reshuffled = false;
        if (this.deck.cards.length === 0) {
            // Reshuffle the deck when it runs out of cards
            this.reshuffle();
            reshuffled = true;
        }
        // Check if three cards have already been drawn and if a bet has been placed
        if (this.cardsDrawn >= 3 || (this.cardsDrawn >= 2 && !this.betPlaced)) {
            return { error: 'You can only draw two cards before placing a bet' };
        }
        this.currentCards = this.deck.cards.splice(0, 1);
        this.cardsDrawn++; // Increment the number of cards drawn
    
        // Check if the drawn card is an Ace
        const isAce = this.currentCards[0][0] === 'A';
    
        // Find the index of the current player in the players array
        const currentPlayerIndex = players.findIndex(player => player._id === currentPlayer._id);
    
        return { cards: this.currentCards, reshuffled, isAce };
    }

    nextPlayer(currentPlayer, players) {
        // Find the index of the current player in the players array
        const currentPlayerIndex = players.findIndex(player => player._id === currentPlayer._id);
    
        // Calculate the index of the next player
        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    
        // Discard the current cards
        this.discardCards();
    
        // Reset cardsDrawn
        this.cardsDrawn = 0;
    
        // Return the next player
        return players[nextPlayerIndex];
    }

    reshuffle() {
        // Reset the deck
        this.deck = new Deck();
        this.deck.shuffle();
    }

    pass() {
        return this.drawCards(2); // Draw two new cards
    }

    getRemainingCardsCount() {
        return this.deck.cards.length;
    }

    setAceValue(value) {
        // Log the received Ace value
        console.log('Received Ace value:', value);
    
        // Set the value of the Ace
        this.aceValue = value;
    
        // If the Ace is high, replace the 'A' in the cards array with 14
        if (value === 'high') {
            this.cards = this.cards.map(card => card === 'A' ? 14 : card);
        }
        // If the Ace is low, replace the 'A' in the cards array with 1
        else if (value === 'low') {
            this.cards = this.cards.map(card => card === 'A' ? 1 : card);
        }
    }

    checkWin(cards, aceValue) {
        // Ensure that there are exactly 3 cards
        if (cards.length !== 3) {
            throw new Error('Invalid number of cards. Expected 3 cards.');
        }
    
        // Map the cards to their values, using the aceValue for Aces
        const cardValues = cards.map(card => {
            const cardValue = card.slice(0, -1); // Remove the last character (the suit)
            if (cardValue === 'A') {
                return Number(aceValue);
            } else if (cardValue === 'K') {
                return 13;
            } else if (cardValue === 'Q') {
                return 12;
            } else if (cardValue === 'J') {
                return 11;
            } else if (cardValue === '10') {
                return 10;
            } else {
                return Number(cardValue);
            }
        });
    
        // Get the minimum and maximum of all three cards
        const minCardValue = Math.min(...cardValues);
        const maxCardValue = Math.max(...cardValues);
    
        // Check if the 3rd card is numerically between the 1st and 2nd cards
        if (minCardValue < cardValues[2] && cardValues[2] < maxCardValue) {
            return 'Win';
        } else {
            return 'Lose';
        }
    }

    

}

module.exports = GameLogic;