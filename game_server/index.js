const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { Game } = require("./game");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let game = new Game(); // Initialize the game instance

// Function to broadcast the game state to all clients
const broadcastGameState = () => {
  const gameState = {
    type: "UPDATE",
    board: game.getBoard(),
    currentPlayer: game.currentPlayer,
    enableControls: game.currentPlayer, // Enable controls for the current player
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(gameState));
    }
  });
};

// Handle new client connections
wss.on("connection", (ws) => {
  // Send the initial board state to the new client
  ws.send(
    JSON.stringify({
      type: "UPDATE",
      board: game.getBoard(),
      currentPlayer: game.currentPlayer,
      enableControls: game.currentPlayer, // Enable controls for the current player
    })
  );

  // Handle incoming messages
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "MOVE") {
      // Check if it's the correct player's turn
      if (game.currentPlayer !== data.player) {
        ws.send(
          JSON.stringify({
            error: "It's not your turn!",
            enableControls: game.currentPlayer, // Re-enable correct player's controls
          })
        );
        return;
      }

      // Process the move
      const result = game.move(data.player, data.command);

      if (result.error) {
        ws.send(
          JSON.stringify({
            error: result.error,
            enableControls: game.currentPlayer, // Ensure the current player retains control if invalid move
          })
        );
      } else {
        // Broadcast the updated game state to all connected clients
        broadcastGameState();
      }
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
    // Optionally handle client disconnection here (e.g., cleanup, status updates)
  });
});

// Restart the game instance when the server is restarted
server.on("close", () => {
  game = new Game(); // Reinitialize the game
});

// Start the server
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
