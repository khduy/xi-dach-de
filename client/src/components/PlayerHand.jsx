import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Card from './Card';

const PlayerHand = ({ player, isDealer = false, isCurrentPlayer = false, revealed = false }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: { xs: 0.5, sm: 1, md: 2 },
        margin: { xs: 0.25, sm: 0.5, md: 1 },
        minWidth: { xs: '92%', sm: '200px' },
        maxWidth: '100%',
        backgroundColor: 'white',
        border: isCurrentPlayer ? '2px solid #2196f3' : '1px solid #ccc',
        boxShadow: isCurrentPlayer 
          ? '0 0 10px rgba(33, 150, 243, 0.4)' 
          : 'none',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{
          fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
          mb: { xs: 0.25, sm: 0.5, md: 1 },
          px: { xs: 0.5, sm: 1 }
        }}
      >
        {player.name} {isDealer ? '(Cái)' : ''} 
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          gap: { xs: 0.15, sm: 0.25, md: 0.5 },
          marginTop: { xs: 0.25, sm: 0.5, md: 1 },
          marginX: { xs: -0.25, sm: 0 },
          padding: { xs: '1px', sm: '2px', md: '4px' },
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '& > *': {
            scrollSnapAlign: 'start',
          }
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
            marginTop: { xs: 0.25, sm: 0.5, md: 1 },
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            px: { xs: 0.5, sm: 1 }
          }}
        >
          Quắc!
        </Typography>
      )}
      
      {player.status === 'stood' && (
        <Typography 
          color="primary" 
          sx={{ 
            marginTop: { xs: 0.25, sm: 0.5, md: 1 },
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            px: { xs: 0.5, sm: 1 }
          }}
        >
          Đã dằn
        </Typography>
      )}
    </Paper>
  );
};

export default PlayerHand; 