const express = require('express');
const ObjectId = require('mongodb').ObjectId;


class PlayersCollection {
  constructor(playersCollection, potCollection) {
    this.playersCollection = playersCollection;
    this.potCollection = potCollection;
    this.router = express.Router();
    this.currentPlayerIndex = 0;

    // Bind the methods
    this.addPlayer = this.addPlayer.bind(this);
    this.editPlayer = this.editPlayer.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
    this.getAllPlayers = this.getAllPlayers.bind(this);
    this.getPlayerBalance = this.getPlayerBalance.bind(this);
    this.getCurrentPlayer = this.getCurrentPlayer.bind(this);
    this.nextPlayer = this.nextPlayer.bind(this);
    this.isPlayersTurn = this.isPlayersTurn.bind(this);

    // Define the routes
    this.router.post('/add', this.addPlayer);
    this.router.get('/balance/:id', this.getPlayerBalance);
    this.router.put('/balance/:id', this.editPlayer);
    this.router.delete('/remove/:id', this.removePlayer);
    this.router.get('/all', this.getAllPlayers);
    this.router.get('/current', this.getCurrentPlayer);
    this.router.post('/next', this.nextPlayer);
    this.router.get('/is-turn/:id', this.isPlayersTurn);
    this.router.put('/edit/:id', this.editPlayer);
  }

  async addPlayer(req, res) {
    const newPlayer = {
        name: req.body.name,
        balance: req.body.balance
      };
      try {
        const result = await this.playersCollection.insertOne(newPlayer);
        res.status(200).send(result);
      } catch (err) {
        res.status(500).send(err);
      }
    }

    async editPlayer(req, res) {
      const betAmount = req.body.betAmount;
      const id = req.params.id;
      try {
        // Fetch the current player balance
        console.log('ID:', id);
  
        const player = await this.playersCollection.findOne({ _id: new ObjectId(id) });        
        console.log('Player fetched:', player); // Log the fetched player
  
        const currentBalance = player.balance;
  
        // Subtract the bet amount from the current balance
        const newBalance = currentBalance - betAmount;
        const updatedPlayer = { balance: newBalance };
  
        // Update the player balance in the database
        const result = await this.playersCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedPlayer });
        console.log('Update result:', result); // Log the update result
  
        // Fetch the updated player data
        const updatedPlayerData = await this.playersCollection.findOne({ _id: new ObjectId(id) });
  
        // Fetch the current pot
        const pot = await this.potCollection.findOne({}); // Fetch the pot from the pot collection
        const currentPot = pot.value;
  
        // Add the bet amount to the current pot
        const newPot = Number(currentPot) + Number(betAmount);
          
        // Update the pot in the database
        const potResult = await this.potCollection.updateOne({}, { $set: { value: newPot } });
        console.log('Pot update result:', potResult); // Log the pot update result
  
        // Fetch the updated pot
        const updatedPot = await this.potCollection.findOne({});

        // Return the updated player data and the updated pot
        res.json({ player: updatedPlayerData, pot: updatedPot.value });
      } catch (error) {
        console.error('Error updating player balance and pot:', error);
        res.status(500).json({ error: 'An error occurred while updating player balance and pot' });
      }
    }
  

    
    removePlayer = async (req, res) => {
      const id = req.params.id;
      try {
        const result = await this.playersCollection.deleteOne({ _id: id });
        res.status(200).send(result);
      } catch (err) {
        res.status(500).send(err);
      }
    }
    
    getAllPlayers = async (req, res) => {
      try {
        const players = await this.playersCollection.find({}).toArray();
        res.status(200).json(players);
      } catch (err) {
        res.status(500).send(err);
      }
    }

    getPlayerBalance = async (req, res) => {
      const id = req.params.id;
      try {
          const player = await this.playersCollection.findOne({ _id: id });
          res.status(200).json(player.balance);
      } catch (err) {
          res.status(500).send(err);
      }
  }

    // Get the current player
    getCurrentPlayer = async (req, res) => {
      try {
        const players = await this.playersCollection.find({}).toArray();
        const currentPlayer = players[this.currentPlayerIndex];
        res.status(200).json(currentPlayer);
      } catch (err) {
        res.status(500).send(err);
      }
    }
  
    // Move to the next player
    nextPlayer = async (req, res) => {
      try {
        const players = await this.playersCollection.find({}).toArray();
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % players.length;
        res.status(200).json({ message: 'Moved to next player' });
      } catch (err) {
        res.status(500).send(err);
      }
    }
  
    // Check if it's a player's turn
    isPlayersTurn = async (req, res) => {
      const id = req.params.id;
      try {
        const players = await this.playersCollection.find({}).toArray();
        const currentPlayer = players[this.currentPlayerIndex];
        const isTurn = currentPlayer._id === id;
        res.status(200).json({ isTurn });
      } catch (err) {
        res.status(500).send(err);
      }
    }

  getRouter() {
    return this.router;
  }
}

module.exports = PlayersCollection;