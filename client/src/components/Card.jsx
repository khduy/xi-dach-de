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
    width: { xs: 45, sm: 60, md: 80 },
    height: { xs: 70, sm: 90, md: 120 },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    p: { xs: 0.5, sm: 1, md: 1.5 },
    userSelect: 'none',
    m: { xs: 0.25, sm: 0.5 },
    flexShrink: 0,
    borderRadius: { xs: '6px', sm: '8px', md: '12px' },
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    background: 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
    '&:hover': {
      transform: {
        xs: 'translateY(-1px) scale(1.01)',
        sm: 'translateY(-2px) scale(1.01)',
        md: 'translateY(-4px) scale(1.02)'
      },
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }
  },
  hidden: {
    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    color: 'white',
    fontSize: { xs: '20px', sm: '24px', md: '28px' },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:hover': {
      transform: 'translateY(-2px) scale(1.01)',
      boxShadow: '0 4px 12px rgba(33,150,243,0.3)'
    }
  }
};

const valueStyles = {
  fontSize: { xs: '12px', sm: '14px', md: '18px' },
  fontWeight: 'bold',
  fontFamily: "'Playfair Display', serif",
  minWidth: { xs: '14px', sm: '18px', md: '24px' },
  lineHeight: 1
};

const suitStyles = {
  fontSize: { xs: '18px', sm: '24px', md: '32px' },
  textAlign: 'center',
  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
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