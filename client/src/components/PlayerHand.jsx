import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Card from './Card';

const PlayerHand = ({ player, isDealer = false, isCurrentPlayer = false, revealed = false }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: { xs: 1, sm: 2 },
        margin: { xs: 0.5, sm: 1 },
        minWidth: { xs: '100%', sm: 200 },
        backgroundColor: 'white',
        border: isCurrentPlayer ? '2px solid #2196f3' : '1px solid #ccc',
        boxShadow: isCurrentPlayer 
          ? '0 0 15px rgba(33, 150, 243, 0.5)' 
          : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{
          fontSize: { xs: '1rem', sm: '1.25rem' },
          mb: { xs: 0.5, sm: 1 }
        }}
      >
        {player.name} {isDealer ? '(Cái)' : ''} 
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          gap: { xs: 0.5, sm: 1 },
          marginTop: { xs: 0.5, sm: 1 },
          padding: { xs: '2px', sm: '4px' },
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          '& > *': {
            scrollSnapAlign: 'start',
          },
          '&::-webkit-scrollbar': {
            height: { xs: '4px', sm: '8px' },
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      >
        {player.hand.map((card, index) => (
          <Card
            key={`${card.suit}-${card.value}-${index}`}
            card={card}
            hidden={!revealed}
          />
        ))}
      </Box>

      {player.status === 'bust' && (
        <Typography 
          color="error" 
          sx={{ 
            marginTop: { xs: 0.5, sm: 1 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Quắc!
        </Typography>
      )}
      
      {player.status === 'stood' && (
        <Typography 
          color="primary" 
          sx={{ 
            marginTop: { xs: 0.5, sm: 1 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Đã dằn
        </Typography>
      )}
    </Paper>
  );
};

export default PlayerHand; 