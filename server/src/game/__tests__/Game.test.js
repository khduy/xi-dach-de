const Game = require('../Game');

describe('Game', () => {
  let game;
  const dealer = {
    id: 'dealer-id',
    name: 'Dealer',
    hand: [],
    status: 'waiting'
  };

  beforeEach(() => {
    game = new Game('test-room', dealer);
  });

  describe('initialization', () => {
    it('should create a game with correct initial state', () => {
      expect(game.roomId).toBe('test-room');
      expect(game.dealer).toBe(dealer);
      expect(game.players.size).toBe(0);
      expect(game.state).toBe('waiting');
      expect(game.currentTurn).toBeNull();
      expect(game.dealingOrder).toEqual([]);
      expect(game.deck.length).toBe(52);
    });

    it('should create a shuffled deck', () => {
      const game2 = new Game('test-room', dealer);
      expect(game.deck).not.toEqual(game2.deck);
      expect(game.deck.length).toBe(52);
    });
  });

  describe('player management', () => {
    it('should add players correctly', () => {
      const result = game.addPlayer('player1', 'Player 1');
      expect(result).toBe(true);
      expect(game.players.size).toBe(1);
      expect(game.players.get('player1')).toEqual({
        id: 'player1',
        name: 'Player 1',
        hand: [],
        status: 'waiting'
      });
    });

    it('should limit the number of players to 7', () => {
      for (let i = 1; i <= 7; i++) {
        expect(game.addPlayer(`player${i}`, `Player ${i}`)).toBe(true);
      }
      expect(game.addPlayer('player8', 'Player 8')).toBe(false);
      expect(game.players.size).toBe(7);
    });
  });

  describe('card dealing', () => {
    beforeEach(() => {
      game.addPlayer('player1', 'Player 1');
      game.addPlayer('player2', 'Player 2');
    });

    it('should deal initial cards correctly', () => {
      const result = game.dealInitialCards();
      expect(result).toBe(true);
      expect(game.state).toBe('playing');
      expect(game.dealer.hand.length).toBe(2);
      expect(game.players.get('player1').hand.length).toBe(2);
      expect(game.players.get('player2').hand.length).toBe(2);
    });

    it('should not deal cards if game is not in waiting state', () => {
      game.state = 'playing';
      const result = game.dealInitialCards();
      expect(result).toBe(false);
    });
  });

  describe('hand value calculation', () => {
    it('should calculate numeric cards correctly', () => {
      const hand = [
        { suit: 'hearts', value: '2' },
        { suit: 'clubs', value: '5' }
      ];
      expect(game.calculateHandValue(hand)).toBe(7);
    });

    it('should calculate face cards correctly', () => {
      const hand = [
        { suit: 'hearts', value: 'K' },
        { suit: 'clubs', value: 'Q' }
      ];
      expect(game.calculateHandValue(hand)).toBe(20);
    });

    it('should handle aces flexibly', () => {
      const hand1 = [
        { suit: 'hearts', value: 'A' },
        { suit: 'clubs', value: '5' }
      ];
      expect(game.calculateHandValue(hand1)).toBe(16);

      const hand2 = [
        { suit: 'hearts', value: 'A' },
        { suit: 'clubs', value: 'K' }
      ];
      expect(game.calculateHandValue(hand2)).toBe(21);

      const hand3 = [
        { suit: 'hearts', value: 'A' },
        { suit: 'clubs', value: 'A' }
      ];
      expect(game.calculateHandValue(hand3)).toBe(12);

      // Test case for multiple aces
      const hand4 = [
        { suit: 'hearts', value: 'A' },
        { suit: 'clubs', value: '8' },
        { suit: 'diamonds', value: 'A' },
        { suit: 'spades', value: 'A' },
        { suit: 'hearts', value: '2' }
      ];
      expect(game.calculateHandValue(hand4)).toBe(13); // 1 + 8 + 1 + 1 + 2 = 13
    });
  });

  describe('special hands detection', () => {
    it('should detect Xì Bàng (two aces)', () => {
      const hand = [
        { suit: 'hearts', value: 'A' },
        { suit: 'clubs', value: 'A' }
      ];
      expect(game.checkSpecialHand(hand)).toBe('xiBang');
    });

    it('should detect Xì Dách (ace + ten-value card)', () => {
      const hands = [
        [
          { suit: 'hearts', value: 'A' },
          { suit: 'clubs', value: '10' }
        ],
        [
          { suit: 'hearts', value: 'A' },
          { suit: 'clubs', value: 'K' }
        ]
      ];
      hands.forEach(hand => {
        expect(game.checkSpecialHand(hand)).toBe('xiDach');
      });
    });

    it('should return null for non-special hands', () => {
      const hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: '9' }
      ];
      expect(game.checkSpecialHand(hand)).toBeNull();
    });
  });

  describe('game flow', () => {
    beforeEach(() => {
      game.addPlayer('player1', 'Player 1');
      game.addPlayer('player2', 'Player 2');
      game.dealInitialCards();
    });

    it('should handle player turns correctly', () => {
      expect(game.currentTurn).toBe(game.dealingOrder[0]);
      game.nextTurn();
      expect(game.currentTurn).toBe(game.dealingOrder[1]);
    });

    it('should move to dealer after all players have played', () => {
      game.players.get('player1').status = 'stood';
      game.players.get('player2').status = 'stood';
      game.nextTurn();
      expect(game.currentTurn).toBe(dealer.id);
    });

    it('should end game when all players and dealer have finished', () => {
      game.players.get('player1').status = 'stood';
      game.players.get('player2').status = 'stood';
      game.dealer.status = 'stood';
      game.nextTurn();
      expect(game.state).toBe('finished');
    });
  });

  describe('hand comparison', () => {
    beforeEach(() => {
      game.addPlayer('player1', 'Player 1');
      game.dealInitialCards();
    });

    it('should not allow comparison if dealer hand value is less than 16', () => {
      game.dealer.hand = [
        { suit: 'hearts', value: '5' },
        { suit: 'clubs', value: '5' }
      ];
      
      const player = game.players.get('player1');
      player.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: 'K' }
      ];
      player.status = 'stood';

      expect(game.compareHands('dealer-id', 'player1')).toEqual({
        success: false,
        reason: 'dealerHandTooLow'
      });
    });

    it('should allow comparison if dealer hand value is 16 or more', () => {
      game.dealer.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: '6' }
      ];
      
      const player = game.players.get('player1');
      player.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: '5' }
      ];
      player.status = 'stood';

      const result = game.compareHands('dealer-id', 'player1');
      expect(result.success).toBe(true);
      expect(result.result).toBe('dealerWin');
    });

    it('should not allow comparison if player has not stood', () => {
      game.dealer.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: '6' }
      ];
      
      const player = game.players.get('player1');
      player.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: '5' }
      ];
      player.status = 'playing';

      expect(game.compareHands('dealer-id', 'player1')).toEqual({
        success: false,
        reason: 'playerNotStood'
      });
    });

    it('should add player to revealed players after comparison', () => {
      game.dealer.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: '6' }
      ];
      
      const player = game.players.get('player1');
      player.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: '5' }
      ];
      player.status = 'stood';

      game.compareHands('dealer-id', 'player1');
      expect(game.revealedPlayers.has('player1')).toBe(true);
    });

    it('should handle Xì Bàng vs regular hand', () => {
      game.dealer.hand = [
        { suit: 'hearts', value: 'A' },
        { suit: 'clubs', value: 'A' }
      ];
      
      const player = game.players.get('player1');
      player.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: 'K' }
      ];
      player.status = 'stood';

      const result = game.compareHands('dealer-id', 'player1');
      expect(result.success).toBe(true);
      expect(result.result).toBe('dealerWin');
    });

    it('should handle Ngũ Linh correctly', () => {
      game.dealer.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: 'K' }
      ];
      game.dealer.status = 'stood';

      game.addPlayer('player1', 'Player 1');
      const player = game.players.get('player1');
      player.hand = [
        { suit: 'hearts', value: '2' },
        { suit: 'clubs', value: '3' },
        { suit: 'diamonds', value: '4' },
        { suit: 'spades', value: '5' },
        { suit: 'hearts', value: '3' }
      ];
      player.status = 'stood';

      expect(game.compareHands('dealer-id', 'player1')).toBe('playerWin');
    });

    it('should handle normal hand comparison', () => {
      game.dealer.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: '8' }
      ];
      game.dealer.status = 'stood';

      game.addPlayer('player1', 'Player 1');
      const player = game.players.get('player1');
      player.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: '9' }
      ];
      player.status = 'stood';

      expect(game.compareHands('dealer-id', 'player1')).toBe('playerWin');
    });

    it('should handle bust cases', () => {
      game.dealer.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: 'K' },
        { suit: 'diamonds', value: '5' }
      ];
      game.dealer.status = 'stood';

      game.addPlayer('player1', 'Player 1');
      const player = game.players.get('player1');
      player.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: '9' }
      ];
      player.status = 'stood';

      expect(game.compareHands('dealer-id', 'player1')).toBe('playerWin');
    });

    it('should result in tie when both dealer and player bust', () => {
      game.dealer.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: 'K' },
        { suit: 'diamonds', value: '5' }
      ];
      game.dealer.status = 'stood';

      game.addPlayer('player1', 'Player 1');
      const player = game.players.get('player1');
      player.hand = [
        { suit: 'hearts', value: '10' },
        { suit: 'clubs', value: 'K' },
        { suit: 'spades', value: '3' }
      ];
      player.status = 'bust';

      // Trigger game end
      game.checkGameEnd();
      expect(player.result).toBe('tie');
    });
  });
}); 