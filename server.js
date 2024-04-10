const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const Deck = require('./logic/deck');
const GameLogic = require('./logic/logic');
const PlayersCollection = require('./playersCollection/playersCollection');

const uri = "mongodb+srv://coffeedevsolutions:fvP1XuVa0ElMjlHx@sheets.xuamfyi.mongodb.net/?retryWrites=true&w=majority&appName=Sheets";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(cors()); // Initialize CORS
app.use(express.json()); // for parsing application/json

const gameLogic = new GameLogic(); // Create an instance of GameLogic

let potCollection; // Declare potCollection outside of the run function

async function run() {
    try {
      await client.connect();
      console.log("Connected to MongoDB");

      const playersCollection = client.db('Sheets').collection('players');
      potCollection = client.db('Sheets').collection('pot'); // Assign potCollection inside the run function

      const players = new PlayersCollection(playersCollection, potCollection);
      app.use('/player', players.getRouter());

      // You can now use potCollection to interact with the pot in your database
    } catch (err) {
      console.error(err);
    }
}
  
run().catch(console.dir);

app.post('/draw', (req, res) => {
    const { currentPlayer, players, aceValue } = req.body;
    if (!Array.isArray(players)) {
        return res.status(400).json({ error: 'players must be an array' });
    }
    
    const result = gameLogic.drawCards(currentPlayer, players, aceValue);
    res.json(result);
});

app.post('/nextPlayer', (req, res) => {
    const { currentPlayer, players } = req.body;
    if (!Array.isArray(players)) {
        return res.status(400).json({ error: 'players must be an array' });
    }
    console.log('Current player:', currentPlayer); // Log the current player
    console.log('Players:', players); // Log the players
    const nextPlayer = gameLogic.nextPlayer(currentPlayer, players);
    console.log('Next player:', nextPlayer); // Log the next player
    if (!nextPlayer) {
        return res.status(400).json({ error: 'Next player not found' });
    }
    res.json(nextPlayer);
});

app.post('/place-bet', (req, res) => {
    const card = gameLogic.placeBet();
    res.json(card);
});

app.post('/bet', (req, res) => {
    const amount = req.body.amount;
    const cards = req.body.cards;
    const aceValue = req.body.aceValue;
    const players = req.body.players; // Add this line
    const currentPlayer = req.body.currentPlayer; // Add this line

    if (!Array.isArray(cards)) {
        return res.status(400).json({ error: 'cards must be an array' });
    }

    if (!Array.isArray(players)) { // Add this check
        return res.status(400).json({ error: 'players must be an array' });
    }

    const { result, thirdCard } = gameLogic.bet(currentPlayer, players, cards, aceValue); // Pass currentPlayer and players to bet method

    res.json({ thirdCard, result, playerBalance: gameLogic.playerBalance, pot: gameLogic.pot });
});

app.post('/pass', (req, res) => {
    const cards = gameLogic.pass();
    res.json({ cards, playerBalance: gameLogic.playerBalance, pot: gameLogic.pot });
});

app.post('/reshuffle', (req, res) => {
    gameLogic.reshuffle();
    res.json({ message: 'Deck reshuffled' });
});

app.post('/discard-cards', (req, res) => {
    gameLogic.discardCards();
    res.json({ message: 'Cards discarded' });
});

app.get('/remaining-cards', (req, res) => {
    const count = gameLogic.getRemainingCardsCount();
    res.json({ count });
});

app.put('/balance/:id', (req, res) => {
    const playerId = req.params.id;
    const betAmount = req.body.betAmount;

    // Find the player by ID and update their balance
    Player.findByIdAndUpdate(playerId, { $inc: { balance: -betAmount } }, { new: true }, (err, player) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error updating balance' });
        }

        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        res.json({ message: 'Balance updated', player });
    });
});

app.get('/pot', async (req, res) => {
    try {
      const pot = await potCollection.findOne({});
      res.json(pot.value);
    } catch (error) {
      console.error('Error fetching pot:', error);
      res.status(500).json({ error: 'An error occurred while fetching the pot' });
    }
  });

  app.post('/checkWin', (req, res) => {
    const cards = req.body.cards;
    const aceValue = req.body.aceValue;
    const result = gameLogic.checkWin(cards, aceValue);
    res.json({ winResult: result });
});

app.post('/setAceValue', (req, res) => {
    const { aceValue } = req.body;
    
    // Log the received Ace value
    console.log('Received Ace value:', aceValue);

    // Set the Ace value in the game logic
    gameLogic.setAceValue(aceValue);

    res.json({ message: 'Ace value set successfully' });
});





// Create a HTTP server and wrap the Express app
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = socketIo(server);

// Listen for Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('my event', (data) => {
        console.log('Received data: ', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const port = process.env.PORT || 8080;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Close the MongoDB client when the server is shutting down
process.on('SIGINT', async () => {
    console.log('Closing MongoDB client...');
    await client.close();
    process.exit();
});