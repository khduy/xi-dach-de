const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const Game = require('./game/Game');
const { throttle } = require('lodash');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
};

const io = socketIO(server, {
  cors: corsOptions,
  transports: ['websocket']
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Xì Dách Game Server');
});

// Game state
const rooms = new Map();
const players = new Map(); // Map<playerName, {roomId, socketId}>
const activeNames = new Set(); // Track active player names

// Helper function to check if name is available
function isNameAvailable(name) {
  return !activeNames.has(name);
}

// Helper function to get room list
function getRoomList() {
  return Array.from(rooms.entries()).map(([roomId, game]) => ({
    id: roomId,
    dealer: game.dealer.name,
    playerCount: game.players.size + 1 // +1 for dealer
  }));
}

// Throttled room list broadcast
const throttledBroadcastRoomList = throttle(() => {
  const roomList = getRoomList();
  io.emit('roomList', { rooms: roomList });
}, 1000, { leading: true, trailing: true });

// Helper function to broadcast room list to all clients
function broadcastRoomList() {
  throttledBroadcastRoomList();
}

// Helper function to get state diff
function getStateDiff(oldState, newState) {
  const diff = {};
  if (!oldState) return newState;

  for (const key in newState) {
    if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
      diff[key] = newState[key];
    }
  }
  return diff;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  let lastGameState = null;
  let currentPlayerName = null;

  // Try to restore session from auth data
  const savedPlayerName = socket.handshake.auth.playerName;
  console.log('Auth data received:', {
    savedPlayerName,
    socketId: socket.id,
    activePlayers: Array.from(players.keys()),
    activeNames: Array.from(activeNames)
  });

  if (savedPlayerName) {
    const playerData = players.get(savedPlayerName);
    console.log('Found player data:', {
      savedPlayerName,
      playerData,
      isNameActive: activeNames.has(savedPlayerName)
    });

    if (playerData) {
      console.log('Restoring session for player:', {
        savedPlayerName,
        oldSocketId: playerData.socketId,
        newSocketId: socket.id,
        roomId: playerData.roomId
      });

      currentPlayerName = savedPlayerName;
      playerData.socketId = socket.id;
      socket.join(playerData.roomId);
      const game = rooms.get(playerData.roomId);
      
      if (game) {
        console.log('Found game for reconnection:', {
          roomId: playerData.roomId,
          gameState: game.state,
          players: Array.from(game.players.keys()),
          dealer: game.dealer.id
        });

        socket.emit('reconnected', {
          roomId: playerData.roomId,
          gameState: game.getGameState(savedPlayerName)
        });
      } else {
        console.log('No game found for room:', playerData.roomId);
        // Clean up orphaned player data
        players.delete(savedPlayerName);
        activeNames.delete(savedPlayerName);
      }
    } else {
      // If player data not found but name is active, clean it up
      if (activeNames.has(savedPlayerName)) {
        console.log('Cleaning up orphaned active name:', savedPlayerName);
        activeNames.delete(savedPlayerName);
      }
    }
  }

  // Check name availability
  socket.on('checkName', ({ playerName }, callback) => {
    // Consider a name available if it's the same as the current player's name
    const isAvailable = playerName === currentPlayerName || isNameAvailable(playerName);
    callback({ isAvailable });
  });

  // Create a new room
  socket.on('createRoom', ({ playerName }) => {
    // Check if name is already taken
    if (!isNameAvailable(playerName)) {
      socket.emit('error', { message: 'Name is already taken' });
      return;
    }

    const roomId = generateRoomId();
    const dealer = {
      id: playerName, // Use name as ID
      name: playerName,
      hand: [],
      status: 'waiting'
    };

    const game = new Game(roomId, dealer);
    rooms.set(roomId, game);
    players.set(playerName, { roomId, socketId: socket.id });
    activeNames.add(playerName);
    currentPlayerName = playerName;
    
    socket.join(roomId);
    lastGameState = game.getGameState(playerName);
    socket.emit('roomCreated', { roomId, gameState: lastGameState });
    
    broadcastRoomList();
  });

  // Join an existing room
  socket.on('joinRoom', ({ roomId, playerName }) => {
    // Check if name is already taken
    if (!isNameAvailable(playerName)) {
      socket.emit('error', { message: 'Name is already taken' });
      return;
    }

    const game = rooms.get(roomId);
    if (!game) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (!game.addPlayer(playerName)) { // Simplified addPlayer call
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    players.set(playerName, { roomId, socketId: socket.id });
    activeNames.add(playerName);
    currentPlayerName = playerName;
    socket.join(roomId);

    // Notify all players in the room
    io.to(roomId).emit('playerJoined', { gameState: game.getGameState(playerName) });
    broadcastRoomList();
  });

  // Leave room with cleanup
  socket.on('leaveRoom', ({ roomId }) => {
    if (!currentPlayerName) return;
    const playerData = players.get(currentPlayerName);
    if (!playerData || playerData.roomId !== roomId) return;

    const game = rooms.get(roomId);
    if (!game) return;

    if (game.dealer.id === currentPlayerName) {
      io.to(roomId).emit('gameCancelled', { reason: 'Cái đã thoát' });
      rooms.delete(roomId);
      io.emit('roomClosed', { roomId });
    } else {
      game.players.delete(currentPlayerName);
      const newState = game.getGameState(currentPlayerName);
      io.to(roomId).emit('playerLeft', { 
        playerId: currentPlayerName,
        gameState: getStateDiff(lastGameState, newState)
      });
      lastGameState = newState;
    }

    socket.leave(roomId);
    players.delete(currentPlayerName);
    activeNames.delete(currentPlayerName);
    currentPlayerName = null;
    broadcastRoomList();
  });

  // Handle explicit reconnection request
  socket.on('reconnect', ({ playerName }) => {
    console.log('Explicit reconnection attempt:', {
      playerName,
      currentPlayerName,
      isNameActive: activeNames.has(playerName),
      hasPlayerData: players.has(playerName)
    });

    const playerData = players.get(playerName);
    if (playerData) {
      console.log('Found player data for reconnection:', {
        playerName,
        oldSocketId: playerData.socketId,
        newSocketId: socket.id,
        roomId: playerData.roomId
      });

      // Update socket ID for the player
      playerData.socketId = socket.id;
      currentPlayerName = playerName;

      const game = rooms.get(playerData.roomId);
      if (game) {
        console.log('Found game for explicit reconnection:', {
          roomId: playerData.roomId,
          gameState: game.state,
          players: Array.from(game.players.keys()),
          dealer: game.dealer.id
        });

        socket.join(playerData.roomId);
        socket.emit('reconnected', { 
          roomId: playerData.roomId,
          gameState: game.getGameState(playerName)
        });
      } else {
        console.log('No game found for room:', playerData.roomId);
        // Clean up orphaned player data
        players.delete(playerName);
        activeNames.delete(playerName);
      }
    } else {
      console.log('No player data found for reconnection:', playerName);
      // If no player data found, remove from active names to allow re-registration
      activeNames.delete(playerName);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (!currentPlayerName) return;

    const playerData = players.get(currentPlayerName);
    if (!playerData) return;

    // Keep the player's data for potential reconnection
    // But start a cleanup timeout
    setTimeout(() => {
      const currentData = players.get(currentPlayerName);
      // Only clean up if the socket ID hasn't changed (meaning no reconnection)
      if (currentData && currentData.socketId === socket.id) {
        const game = rooms.get(currentData.roomId);
        if (game) {
          if (game.dealer.id === currentPlayerName) {
            io.to(currentData.roomId).emit('gameCancelled', { reason: 'Cái đã mất kết nối' });
            rooms.delete(currentData.roomId);
            io.emit('roomClosed', { roomId: currentData.roomId });
          } else {
            game.players.delete(currentPlayerName);
            io.to(currentData.roomId).emit('playerLeft', { 
              playerId: currentPlayerName,
              gameState: game.getGameState(currentPlayerName)
            });
          }
        }
        players.delete(currentPlayerName);
        activeNames.delete(currentPlayerName);
        broadcastRoomList();
      }
    }, 60000); // 1 minute timeout for reconnection
  });

  // Send room list when requested (throttled per socket)
  const throttledGetRooms = throttle(() => {
    socket.emit('roomList', { rooms: getRoomList() });
  }, 1000, { leading: true, trailing: true });

  socket.on('getRooms', throttledGetRooms);

  // Start the game
  socket.on('startGame', () => {
    const playerData = players.get(currentPlayerName);
    if (!playerData) return;

    const game = rooms.get(playerData.roomId);
    if (!game || game.dealer.id !== currentPlayerName) return;

    // Deal initial cards to all players
    if (!game.dealInitialCards()) {
      socket.emit('error', { message: 'Failed to deal cards' });
      return;
    }

    // Get all sockets in the room
    const room = io.sockets.adapter.rooms.get(playerData.roomId);
    if (room) {
      // Send each player their own game state perspective
      for (const socketId of room) {
        // Find the player name associated with this socket ID
        const playerEntry = Array.from(players.entries()).find(([_, data]) => data.socketId === socketId);
        if (playerEntry) {
          const [playerName] = playerEntry;
          io.to(socketId).emit('gameStarted', {
            gameState: game.getGameState(playerName)
          });
        }
      }
    }
  });

  // Draw a card
  socket.on('drawCard', () => {
    const playerData = players.get(currentPlayerName);
    if (!playerData) return;

    const game = rooms.get(playerData.roomId);
    if (!game || game.currentTurn !== currentPlayerName) return;

    const result = game.drawCard(currentPlayerName);
    if (!result) return;

    io.to(playerData.roomId).emit('cardDrawn', {
      playerId: currentPlayerName,
      gameState: game.getGameState(currentPlayerName),
      ...result
    });
  });

  // Stand
  socket.on('stand', () => {
    const playerData = players.get(currentPlayerName);
    if (!playerData) return;

    const game = rooms.get(playerData.roomId);
    if (!game || game.currentTurn !== currentPlayerName) return;

    const result = game.stand(currentPlayerName);
    if (!result.success) {
      socket.emit('error', { message: 'Cannot stand yet' });
      return;
    }

    io.to(playerData.roomId).emit('playerStood', {
      playerId: currentPlayerName,
      gameState: game.getGameState(currentPlayerName)
    });
  });

  // Compare hands (dealer only)
  socket.on('compareHands', ({ targetPlayerId }) => {
    const playerData = players.get(currentPlayerName);
    if (!playerData) return;

    const game = rooms.get(playerData.roomId);
    if (!game || game.dealer.id !== currentPlayerName) return;

    const result = game.compareHands(currentPlayerName, targetPlayerId);
    if (!result) {
      socket.emit('error', { message: 'Cannot compare hands yet' });
      return;
    }

    io.to(playerData.roomId).emit('handsCompared', {
      dealerId: currentPlayerName,
      playerId: targetPlayerId,
      result,
      gameState: game.getGameState(currentPlayerName)
    });
  });

  // Restart game (dealer only)
  socket.on('restartGame', () => {
    console.log('Restart game requested by:', currentPlayerName);
    const playerData = players.get(currentPlayerName);
    if (!playerData) {
      console.log('No player data found');
      return;
    }

    const game = rooms.get(playerData.roomId);
    if (!game || game.dealer.id !== currentPlayerName) {
      console.log('Invalid game or not dealer');
      return;
    }

    if (game.state !== 'finished') {
      console.log('Game not finished, current state:', game.state);
      socket.emit('error', { message: 'Cannot restart game yet' });
      return;
    }

    // Reset the game
    game.restartGame();
    console.log('Game restarted, new state:', game.getGameState(currentPlayerName));

    // Notify all players in the room
    io.to(playerData.roomId).emit('gameRestarted', { 
      gameState: game.getGameState(currentPlayerName)
    });

    // Update room list since game state changed
    broadcastRoomList();
  });
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 