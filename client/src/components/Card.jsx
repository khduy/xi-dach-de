import React from 'react';
import { Paper, Box, Fade } from '@mui/material';

const suitColors = {
  hearts: '#ff0000',
  diamonds: '#ff0000',
  clubs: '#000000',
  spades: '#000000'
};

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const cardStyles = {
  base: {
    width: { xs: 60, sm: 80 },
    height: { xs: 90, sm: 120 },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    p: { xs: 1, sm: 1.5 },
    userSelect: 'none',
    m: 0.5,
    flexShrink: 0,
    borderRadius: { xs: '8px', sm: '12px' },
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    background: 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
    '&:hover': {
      transform: {
        xs: 'translateY(-2px) scale(1.01)',
        sm: 'translateY(-4px) scale(1.02)'
      },
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
    }
  },
  hidden: {
    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    color: 'white',
    fontSize: '28px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 8px 24px rgba(33,150,243,0.4)'
    }
  }
};

const valueStyles = {
  fontSize: { xs: '14px', sm: '18px' },
  fontWeight: 'bold',
  fontFamily: "'Playfair Display', serif",
  minWidth: { xs: '18px', sm: '24px' },
  lineHeight: 1
};

const suitStyles = {
  fontSize: { xs: '24px', sm: '32px' },
  textAlign: 'center',
  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  lineHeight: 1
};

function Card({ card, hidden = false }) {
  if (hidden) {
    return (
      <Fade in={true} timeout={500}>
        <Paper sx={{ ...cardStyles.base, ...cardStyles.hidden }}>
          <Box sx={{ 
            width: '100%',
            height: '100%',
            background: `repeating-linear-gradient(
              45deg,
              rgba(255,255,255,0.1),
              rgba(255,255,255,0.1) 10px,
              transparent 10px,
              transparent 20px
            )`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            ?
          </Box>
        </Paper>
      </Fade>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Paper sx={cardStyles.base}>
        <Box sx={{ ...valueStyles, color: suitColors[card.suit] }}>
          {card.value}
        </Box>
        <Box sx={{ ...suitStyles, color: suitColors[card.suit] }}>
          {suitSymbols[card.suit]}
        </Box>
        <Box sx={{ 
          ...valueStyles, 
          alignSelf: 'flex-end', 
          transform: 'rotate(180deg)',
          color: suitColors[card.suit]
        }}>
          {card.value}
        </Box>
      </Paper>
    </Fade>
  );
}

export default Card; 