import React, { useState, useEffect, useCallback } from 'react';
import { 
  CssBaseline, 
  Container, 
  Box, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { io } from 'socket.io-client';
import Card from './components/Card';
import logo from './logo.png';

// Add theme styles
const tableStyles = {
  background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
  minHeight: '100vh',
  padding: { xs: '4px', sm: '12px', md: '24px' },
  color: 'white',
  transition: 'all 0.3s ease'
};

const cardTableStyles = {
  background: 'linear-gradient(to bottom, #2d2d2d, #1f1f1f)',
  border: { xs: '8px solid #4a3728', sm: '12px solid #4a3728' },
  borderRadius: { xs: '16px', sm: '24px' },
  padding: { xs: '8px', sm: '16px', md: '32px' },
  boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
  position: 'relative',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  overflow: 'hidden'
};

const playerAreaStyles = {
  background: 'rgba(0,0,0,0.5)',
  borderRadius: '16px',
  padding: { xs: '12px', sm: '16px', md: '24px' },
  marginBottom: { xs: '12px', sm: '24px' },
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  minWidth: { xs: '280px', sm: '400px' },
  maxWidth: '100%',
  width: '100%',
  border: '1px solid rgba(255,255,255,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
  }
};

const cardAreaStyles = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: { xs: '8px', sm: '12px' },
  padding: { xs: '12px', sm: '24px' },
  minHeight: { xs: '100px', sm: '140px' },
  background: 'rgba(0,0,0,0.4)',
  borderRadius: '16px',
  marginTop: { xs: '8px', sm: '12px' },
  border: '1px solid rgba(255,255,255,0.15)',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  overflow: 'auto'
};

const goldText = {
  color: '#FFD700',
  textShadow: '0 2px 8px rgba(255,215,0,0.3)',
  fontWeight: 'bold',
  letterSpacing: '1px'
};

const buttonStyles = {
  background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
  boxShadow: '0 4px 16px rgba(33,150,243,0.3)',
  color: 'white',
  padding: '12px 32px',
  borderRadius: '8px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(33,150,243,0.4)'
  },
  '&:disabled': {
    background: '#666',
    transform: 'none'
  }
};

const resultStyles = {
  win: {
    background: 'linear-gradient(45deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.2) 100%)',
    border: '2px solid #4CAF50',
    color: '#4CAF50',
    padding: '16px 24px',
    borderRadius: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '16px',
    animation: 'pulse 2s infinite',
    boxShadow: '0 4px 16px rgba(76,175,80,0.2)'
  },
  lose: {
    background: 'linear-gradient(45deg, rgba(244,67,54,0.1) 0%, rgba(244,67,54,0.2) 100%)',
    border: '2px solid #f44336',
    color: '#f44336',
    padding: '16px 24px',
    borderRadius: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '16px',
    animation: 'shake 0.5s',
    boxShadow: '0 4px 16px rgba(244,67,54,0.2)'
  },
  tie: {
    background: 'linear-gradient(45deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.2) 100%)',
    border: '2px solid #FFD700',
    color: '#FFD700',
    padding: '16px 24px',
    borderRadius: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '16px',
    animation: 'glow 2s infinite',
    boxShadow: '0 4px 16px rgba(255,215,0,0.2)'
  }
};

// Add logo styles
const logoStyles = {
  width: '120px',
  height: 'auto',
  marginBottom: '24px',
  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
  }
};

function App() {
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || '');
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [gameState, setGameState] = useState(null);

  // Socket initialization
  useEffect(() => {
    let newSocket = null;

    const initSocket = () => {
      if (newSocket) return; // Prevent multiple socket creations

      const savedName = localStorage.getItem('playerName');
      console.log('Initializing socket with saved name:', savedName);
      
      if (savedName) {
        setPlayerName(savedName); // Ensure playerName state is synced with localStorage
      }

      newSocket = io(process.env.REACT_APP_SERVER_URL, {
        auth: { playerName: savedName || '' },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket'],
        cors: {
          origin: '*'
        }
      });

      // Set up event listeners
      newSocket.on('connect', () => {
        console.log('Socket connected:', {
          socketId: newSocket.id,
          playerName: savedName
        });
        
        if (savedName) {
          console.log('Attempting reconnection with saved name:', savedName);
          newSocket.emit('reconnect', { playerName: savedName });
        }
        
        newSocket.emit('getRooms');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', { reason, playerName: savedName });
      });

      newSocket.on('reconnected', ({ roomId, gameState }) => {
        console.log('Reconnected to room:', { roomId, gameState, playerName: savedName });
        setCurrentRoom(roomId);
        setGameState(gameState);
      });

      newSocket.on('roomCreated', ({ roomId, gameState }) => {
        console.log('Room created:', { roomId, gameState });
        setCurrentRoom(roomId);
        setGameState(gameState);
      });

      newSocket.on('playerJoined', ({ gameState }) => {
        console.log('Player joined, new game state:', gameState);
        setGameState(gameState);
      });

      newSocket.on('roomList', ({ rooms: roomList }) => {
        console.log('Received room list:', roomList);
        setRooms(roomList);
      });

      newSocket.on('gameStarted', ({ gameState }) => {
        console.log('Game started, new game state:', JSON.stringify(gameState, null, 2));
        setGameState(gameState);
      });

      newSocket.on('cardDrawn', ({ gameState, playerId, card, status, handValue }) => {
        console.log('Card drawn event received:', {
          playerId,
          card,
          status,
          handValue,
          dealerState: gameState.dealer,
          playerState: gameState.players[playerId]
        });
        setGameState(gameState);
      });

      newSocket.on('playerStood', ({ gameState, playerId }) => {
        console.log('Player stood event received:', {
          playerId,
          dealerState: gameState.dealer,
          playerState: gameState.players[playerId]
        });
        setGameState(gameState);
      });

      newSocket.on('handsCompared', ({ gameState, dealerId, playerId, result }) => {
        console.log('Hands compared event received:', {
          dealerId,
          playerId,
          result,
          dealerState: gameState.dealer,
          playerState: gameState.players[playerId]
        });
        setGameState(gameState);
      });

      newSocket.on('gameCancelled', ({ reason }) => {
        setError(reason);
        setCurrentRoom(null);
        setGameState(null);
      });

      newSocket.on('playerLeft', ({ gameState }) => {
        console.log('Player left, new game state:', gameState);
        setGameState(gameState);
      });

      newSocket.on('gameRestarted', ({ gameState }) => {
        console.log('Game restarted, new game state:', JSON.stringify(gameState, null, 2));
        setGameState(gameState);
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      if (newSocket) {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
        newSocket = null;
        setSocket(null);
      }
    };
  }, []); // Empty dependency array since we manage socket lifecycle internally

  const handleCreateRoom = useCallback(() => {
    if (!playerName.trim()) {
      setError('Nhập cái tên vào');
      return;
    }
    const trimmedName = playerName.trim();
    // Check name availability before creating room
    socket?.emit('checkName', { playerName: trimmedName }, (response) => {
      if (response.isAvailable) {
        // Save the name before creating the room
        localStorage.setItem('playerName', trimmedName);
        console.log('Player name saved:', trimmedName);
        socket?.emit('createRoom', { playerName: trimmedName });
      } else {
        setError('Tên này có người xài rồi');
      }
    });
  }, [socket, playerName]);

  const handleJoinRoom = useCallback((roomId) => {
    if (!playerName.trim()) {
      setError('Nhập cái tên vào');
      return;
    }
    const trimmedName = playerName.trim();
    // Check name availability before joining room
    socket?.emit('checkName', { playerName: trimmedName }, (response) => {
      if (response.isAvailable) {
        // Save the name before joining the room
        localStorage.setItem('playerName', trimmedName);
        console.log('Player name saved:', trimmedName);
        socket?.emit('joinRoom', { roomId, playerName: trimmedName });
        setCurrentRoom(roomId);
      } else {
        setError('Tên này có người xài rồi');
      }
    });
  }, [socket, playerName]);

  const handleLeaveRoom = useCallback(() => {
    if (currentRoom) {
      console.log('Leaving room:', currentRoom);
      socket?.emit('leaveRoom', { roomId: currentRoom });
      localStorage.removeItem('playerName');
      setCurrentRoom(null);
      setGameState(null);
    }
  }, [socket, currentRoom]);

  const handleStartGame = useCallback(() => {
    socket?.emit('startGame');
  }, [socket]);

  const handleDrawCard = useCallback(() => {
    socket?.emit('drawCard');
  }, [socket]);

  const handleStand = useCallback(() => {
    socket?.emit('stand');
  }, [socket]);

  const handleCompareHands = useCallback((targetPlayerId) => {
    socket?.emit('compareHands', { targetPlayerId });
  }, [socket]);

  const handleRestartGame = useCallback(() => {
    socket?.emit('restartGame');
  }, [socket]);

  if (!socket) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography>Connecting to server...</Typography>
        </Box>
      </Container>
    );
  }

  if (currentRoom && gameState) {
    console.log('Rendering game view with state:', JSON.stringify(gameState, null, 2));
    
    // Initialize default game state structure if needed
    const safeGameState = {
      ...gameState,
      dealer: gameState.dealer || { id: '', hand: [], status: 'waiting' },
      players: gameState.players || {},
      state: gameState.state || 'waiting',
      currentTurn: gameState.currentTurn || null
    };

    const isDealer = playerName === safeGameState.dealer.id;
    const canStartGame = isDealer && safeGameState.state === 'waiting' && Object.keys(safeGameState.players).length > 0;
    const isCurrentTurn = safeGameState.currentTurn === playerName;
    const myStatus = isDealer ? safeGameState.dealer.status : (safeGameState.players[playerName]?.status || 'waiting');

    // Debug logging for compare button conditions
    if (isDealer) {
      console.log('Compare button conditions:', {
        isDealer,
        gameState: safeGameState.state,
        dealerHandValue: safeGameState.dealer.handValue,
        players: Object.values(safeGameState.players).map(p => ({
          id: p.id,
          name: p.name,
          status: p.status
        }))
      });
    }

    // Convert players array to object if needed
    if (Array.isArray(safeGameState.players)) {
      safeGameState.players = Object.fromEntries(
        safeGameState.players.map(player => [player.id, player])
      );
    }

    // Ensure dealer and players have hands
    const dealerHand = safeGameState.dealer.hand || [];
    const players = safeGameState.players;

    return (
      <Box sx={tableStyles}>
        <Container maxWidth="lg" sx={{ 
          px: { xs: 0, sm: 1, md: 2 }
        }}>
          <Box sx={{
            ...cardTableStyles,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Main Game Content */}
            <Box sx={{ mb: 3 }}>
              {/* All Players Section (including dealer) */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: { xs: 1, sm: 2 },
                justifyContent: 'center'
              }}>
                {/* Dealer */}
                <Box 
                  key={safeGameState.dealer.id} 
                  sx={{
                    ...playerAreaStyles,
                    flex: '1 1 400px',
                    maxWidth: '600px',
                    border: safeGameState.dealer.id === safeGameState.currentTurn ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: safeGameState.dealer.id === safeGameState.currentTurn ? '0 0 15px rgba(255, 215, 0, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  
                  <Typography variant="h6" sx={{ ...goldText, mb: 2 }}>
                    {safeGameState.dealer.name} (Cái)
                  </Typography>
                  
                  {/* Add dealer's special hands result box */}
                  {safeGameState.state === 'finished' && (safeGameState.dealer.status === 'stood' || safeGameState.dealer.status === 'bust') && 
                   (safeGameState.dealer.handValue > 21 || 
                    (safeGameState.dealer.hand.length === 2 && safeGameState.dealer.hand.every(card => card.value === 'A')) ||
                    (safeGameState.dealer.hand.length === 2 && safeGameState.dealer.hand.some(card => card.value === 'A') && 
                     safeGameState.dealer.hand.some(card => ['10', 'J', 'Q', 'K'].includes(card.value))) ||
                    (safeGameState.dealer.hand.length === 5 && safeGameState.dealer.handValue <= 21)) && (
                    <Box sx={resultStyles[
                      safeGameState.dealer.handValue > 21 ? 'lose' :
                      (safeGameState.dealer.hand.length === 2 && safeGameState.dealer.hand.every(card => card.value === 'A')) ? 'win' :
                      (safeGameState.dealer.hand.length === 2 && safeGameState.dealer.hand.some(card => card.value === 'A') && 
                       safeGameState.dealer.hand.some(card => ['10', 'J', 'Q', 'K'].includes(card.value))) ? 'win' :
                      (safeGameState.dealer.hand.length === 5 && safeGameState.dealer.handValue <= 21) ? 'win' :
                      'tie'
                    ]}>
                      {safeGameState.dealer.handValue > 21 ? (
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>😔 Quắc</Typography>
                      ) : (safeGameState.dealer.hand.length === 2 && safeGameState.dealer.hand.every(card => card.value === 'A')) ? (
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>🎉 Xì Bàng!</Typography>
                      ) : (safeGameState.dealer.hand.length === 2 && safeGameState.dealer.hand.some(card => card.value === 'A') && 
                          safeGameState.dealer.hand.some(card => ['10', 'J', 'Q', 'K'].includes(card.value))) ? (
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>🎉 Xì Dách!</Typography>
                      ) : (safeGameState.dealer.hand.length === 5 && safeGameState.dealer.handValue <= 21) ? (
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>🎉 Ngũ Linh!</Typography>
                      ) : null}
                    </Box>
                  )}
                  
                  <Box sx={cardAreaStyles}>
                    {dealerHand.map((card, index) => (
                      <Card 
                        key={`dealer-card-${index}`}
                        card={card} 
                        hidden={!isDealer && !safeGameState.showAllCards && safeGameState.state === 'playing' && safeGameState.dealer.status !== 'stood'}
                      />
                    ))}
                  </Box>
                  {isDealer && isCurrentTurn && myStatus === 'playing' && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleDrawCard}
                        sx={{ flex: 1, py: 1 }}
                      >
                        Rút Bài
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleStand}
                        sx={{ flex: 1, py: 1 }}
                      >
                        Dằn Bài
                      </Button>
                    </Box>
                  )}
                  
                </Box>

                {/* Players */}
                {Object.values(players).map((player) => (
                  <Box 
                    key={player.id} 
                    sx={{
                      ...playerAreaStyles,
                      flex: '1 1 400px',
                      maxWidth: '600px',
                      border: player.id === safeGameState.currentTurn ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)',
                      boxShadow: player.id === safeGameState.currentTurn ? '0 0 15px rgba(255, 215, 0, 0.3)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="h6" sx={{ ...goldText, mb: 2 }}>
                      {player.name}
                    </Typography>
                    
                    {/* Show player's result when game is finished or when hands have been compared */}
                    {(safeGameState.state === 'finished' || safeGameState.revealedPlayers?.[player.id]) && 
                     (player.status === 'stood' || player.status === 'bust') && (
                      <Box sx={resultStyles[
                        isDealer ? 
                          (player.result === 'win' ? 'lose' : 
                           player.result === 'lose' ? 'win' : 
                           'tie') :
                          player.result === 'win' ? 'win' :
                          player.result === 'lose' ? 'lose' :
                          'tie'
                      ]}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {isDealer ? 
                            (player.result === 'win' ? '😔 Thua' : 
                             player.result === 'lose' ? '🎉 Thắng!' : 
                             '🤝 Hòa') :
                            player.result === 'win' ? '🎉 Thắng!' : 
                            player.result === 'lose' ? '😔 Thua' : 
                            '🤝 Hòa'}
                        </Typography>
                        {/* Display special hand status only when there is one */}
                        {(player.handValue > 21 || 
                          player.handValue === 16 ||
                          (player.hand.length === 2 && player.hand.every(card => card.value === 'A')) ||
                          (player.hand.length === 2 && player.hand.some(card => card.value === 'A') && 
                           player.hand.some(card => ['10', 'J', 'Q', 'K'].includes(card.value))) ||
                          (player.hand.length === 5 && player.handValue <= 21)) && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {player.handValue > 21 ? '(Quắc)' : 
                               player.hand.length === 2 && player.hand.every(card => card.value === 'A') ? '(Xì Bàng)' :
                               player.hand.length === 2 && player.hand.some(card => card.value === 'A') && 
                               player.hand.some(card => ['10', 'J', 'Q', 'K'].includes(card.value)) ? '(Xì Dách)' :
                               player.hand.length === 5 && player.handValue <= 21 ? '(Ngũ Linh)' : ''}
                            </Typography>
                        )}
                      </Box>
                    )}
                    <Box sx={cardAreaStyles}>
                      {(player.hand || []).map((card, index) => (
                        <Card 
                          key={`player-${player.id}-card-${index}`}
                          card={card} 
                          hidden={player.id !== playerName && !safeGameState.showAllCards && !safeGameState.revealedPlayers?.[player.id]}
                        />
                      ))}
                    </Box>
                    {/* Player action buttons */}
                    {player.id === playerName && isCurrentTurn && (player.status === 'playing' || player.status === 'bust') && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        {player.status === 'playing' && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleDrawCard}
                            sx={{ flex: 1, py: 1 }}
                          >
                            Rút Bài
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          color="secondary"
                          size="large"
                          onClick={handleStand}
                          sx={{ flex: 1, py: 1 }}
                        >
                          Dằn Bài
                        </Button>
                      </Box>
                    )}
                    {/* Dealer's compare hands button */}
                    {isDealer && safeGameState.state === 'playing' && ['stood', 'bust'].includes(player.status) && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="info"
                          size="large"
                          onClick={() => handleCompareHands(player.id)}
                          disabled={!safeGameState.dealer.handValue || safeGameState.dealer.handValue < 15}
                          sx={{ 
                            width: '100%', 
                            py: 1.5,
                            fontSize: '1.1rem',
                            backgroundColor: safeGameState.dealer.handValue >= 15 ? '#2196f3' : 'grey',
                            '&:hover': {
                              backgroundColor: safeGameState.dealer.handValue >= 15 ? '#1976d2' : 'grey',
                            },
                            '&.Mui-disabled': {
                              color: 'white',
                              backgroundColor: 'grey'
                            }
                          }}
                        >
                          So Bài {(!safeGameState.dealer.handValue || safeGameState.dealer.handValue < 16) ? 
                            `(Cần 15 điểm${safeGameState.dealer.handValue ? `, hiện có ${safeGameState.dealer.handValue} điểm` : ''})` : ''}
                        </Button>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Game Controls */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                {canStartGame && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleStartGame}
                    sx={{ ...buttonStyles, py: 1.5, fontSize: '1.2rem' }}
                  >
                    Bắt Đầu
                  </Button>
                )}

                {isDealer && safeGameState.state === 'finished' && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={handleRestartGame}
                    sx={{ ...buttonStyles, py: 1.5, fontSize: '1.2rem' }}
                  >
                    Chơi Lại
                  </Button>
                )}
              </Box>
            </Box>

            {/* Footer with Room ID and Leave Button */}
            <Box sx={{ 
              mt: 'auto',
              pt: 2,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="body2" sx={{ ...goldText, fontSize: '0.9rem', opacity: 0.8 }}>
                Phòng: {currentRoom}
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleLeaveRoom}
                sx={{ ...buttonStyles }}
              >
                Rời Phòng
              </Button>
            </Box>
          </Box>
        </Container>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            severity="error" 
            variant="filled" 
            onClose={() => setError('')}
            sx={{ background: '#7f1d1d' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // Lobby view
  return (
    <Box sx={tableStyles}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={cardTableStyles}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box 
              component="img"
              src={logo}
              alt="Xì Dách Game Logo"
              sx={logoStyles}
            />
            <Typography variant="h4" gutterBottom align="center" sx={goldText}>
              Xì Dách Đeee
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Tên của bạn"
            variant="outlined"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.3)',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFD700',
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#FFD700'
                }
              }
            }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleCreateRoom}
            disabled={!playerName.trim()}
            sx={{ ...buttonStyles, mb: 3, py: 1.5, fontSize: '1.1rem' }}
          >
            Tạo Phòng Mới
          </Button>

          <Typography variant="h6" gutterBottom sx={goldText}>
            Phòng Hiện Có:
          </Typography>

          {rooms.length === 0 ? (
            <Typography sx={{ color: 'rgba(255,255,255,0.7)' }} align="center">
              Không có phòng nào
            </Typography>
          ) : (
            <List>
              {rooms.map((room) => (
                <ListItem
                  key={room.id}
                  sx={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(0,0,0,0.4)',
                      borderColor: 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  <ListItemText
                    primary={`Phòng: ${room.id}`}
                    secondary={`Nhà Cái: ${room.dealer} (${room.playerCount} người chơi)`}
                    sx={{
                      '& .MuiListItemText-primary': { color: '#FFD700' },
                      '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={!playerName.trim()}
                    sx={{ ...buttonStyles, ml: 2 }}
                  >
                    Vào
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Container>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          variant="filled" 
          onClose={() => setError('')}
          sx={{ background: '#7f1d1d' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App; 