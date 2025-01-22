class Game {
  constructor(roomId, dealer) {
    this.roomId = roomId;
    this.dealer = dealer; // Nhà Cái (using name as ID)
    this.players = new Map(); // Nhà Con (using names as IDs)
    this.deck = this.createDeck();
    this.state = 'waiting'; // waiting, dealing, playing, finished
    this.currentTurn = null;
    this.dealingOrder = [];
    this.revealedPlayers = new Set(); // Track players whose cards have been revealed
  }

  createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];

    for (const suit of suits) {
      for (const value of values) {
        deck.push({ suit, value });
      }
    }

    return this.shuffleDeck([...deck]);
  }

  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  addPlayer(playerName) {
    if (this.players.size >= 7) { // Max 7 Nhà Con + 1 Nhà Cái
      return false;
    }
    this.players.set(playerName, {
      id: playerName,
      name: playerName,
      hand: [],
      status: 'waiting'
    });
    return true;
  }

  calculateHandValue(hand) {
    console.log('Calculating hand value for:', hand);
    if (!hand || hand.length === 0) {
      console.log('Hand is empty or null, returning 0');
      return 0;
    }
    
    let value = 0;
    let aces = 0;

    // First calculate non-ace values
    for (const card of hand) {
      if (card.value === 'A') {
        aces++;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }

    console.log('Initial calculation:', { value, aces });

    // Try all possible ace combinations to find the best value <= 21
    let bestValue = value;
    // For each ace, we can use either 1 or 11
    for (let mask = 0; mask < (1 << aces); mask++) {
      let testValue = value;
      for (let i = 0; i < aces; i++) {
        // If bit is set, use 11, otherwise use 1
        testValue += (mask & (1 << i)) ? 11 : 1;
      }
      // Update bestValue if this combination is better
      if (testValue <= 21 && testValue > bestValue) {
        bestValue = testValue;
      }
    }
    // If all combinations bust, use the smallest possible value
    if (bestValue === value) {
      bestValue = value + aces; // All aces count as 1
    }

    console.log('Final hand value:', bestValue);
    return bestValue;
  }

  checkSpecialHand(hand) {
    if (!hand || hand.length !== 2) return null;

    // Check for Xì Bàng (Two Aces)
    if (hand[0].value === 'A' && hand[1].value === 'A') {
      return 'xiBang';
    }

    // Check for Xì Dách (Ace + 10-value card)
    const hasAce = hand.some(card => card.value === 'A');
    const hasTenValue = hand.some(card => ['10', 'J', 'Q', 'K'].includes(card.value));
    if (hasAce && hasTenValue) {
      return 'xiDach';
    }

    return null;
  }

  dealInitialCards() {
    if (this.state !== 'waiting' || this.players.size === 0) return false;

    this.state = 'dealing';
    // Deal two cards to each player
    for (let i = 0; i < 2; i++) {
      for (const [playerName, player] of this.players) {
        const card = this.deck.pop();
        if (!card) return false; // Not enough cards
        player.hand.push(card);
        if (i === 0) {
          this.dealingOrder.push(playerName);
        }
      }
      // Deal to dealer
      const card = this.deck.pop();
      if (!card) return false; // Not enough cards
      this.dealer.hand.push(card);
    }

    // Check for immediate win conditions
    const dealerSpecial = this.checkSpecialHand(this.dealer.hand);
    let hasImmediateWinner = false;

    // If dealer has Xì Bàng, game ends immediately
    if (dealerSpecial === 'xiBang') {
      this.state = 'finished';
      this.dealer.status = 'stood';
      // All players lose
      for (const player of this.players.values()) {
        player.status = 'stood';
        player.result = 'lose';
      }
      return true;
    }

    // Check each player for Xì Bàng or Xì Dách
    for (const player of this.players.values()) {
      const playerSpecial = this.checkSpecialHand(player.hand);
      if (playerSpecial === 'xiBang' || (playerSpecial === 'xiDach' && dealerSpecial !== 'xiDach')) {
        hasImmediateWinner = true;
        player.status = 'stood';
        player.result = 'win';
      } else if (dealerSpecial === 'xiDach' && playerSpecial !== 'xiBang') {
        hasImmediateWinner = true;
        player.status = 'stood';
        player.result = 'lose';
      }
    }

    // If there's an immediate winner, end the game
    if (hasImmediateWinner) {
      this.state = 'finished';
      this.dealer.status = 'stood';
      // Set result for remaining players
      for (const player of this.players.values()) {
        if (player.result === undefined) {
          player.status = 'stood';
          if (dealerSpecial === 'xiDach') {
            player.result = 'lose';
          } else {
            player.result = 'tie';
          }
        }
      }
      return true;
    }

    // If no immediate winner, continue with normal game
    this.state = 'playing';
    this.currentTurn = this.dealingOrder[0];
    
    // Set first player's status to playing
    const firstPlayer = this.players.get(this.currentTurn);
    if (firstPlayer) {
      firstPlayer.status = 'playing';
    }

    return true;
  }

  drawCard(playerName) {
    console.log(`[drawCard] Player ${playerName} drawing a card`);
    const player = playerName === this.dealer.id ? this.dealer : this.players.get(playerName);
    if (!player || player.status !== 'playing' || player.hand.length >= 5) {
      console.log(`[drawCard] Invalid draw:`, {
        playerExists: !!player,
        status: player?.status,
        handSize: player?.hand?.length
      });
      return false;
    }

    const card = this.deck.pop();
    if (!card) {
      console.log(`[drawCard] No cards left in deck`);
      return false;
    }
    
    player.hand.push(card);
    const handValue = this.calculateHandValue(player.hand);
    console.log(`[drawCard] Drew card:`, {
      playerName,
      card,
      handValue,
      handSize: player.hand.length
    });

    // Check if player busts
    if (handValue > 21) {
      console.log(`[drawCard] Player busted:`, {
        playerName,
        handValue,
        isDealer: playerName === this.dealer.id
      });
      player.status = 'bust';
      // Only auto-end turn for dealer
      if (playerName === this.dealer.id) {
        console.log(`[drawCard] Dealer busted, checking game end`);
        player.status = 'stood'; // Set dealer status to stood when they bust
        this.checkGameEnd();
      } else {
        console.log(`[drawCard] Player busted, waiting for Stand button`);
      }
      return { card, status: 'bust', handValue };
    }

    // Check if player has 5 cards
    if (player.hand.length === 5) {
      console.log(`[drawCard] Player has 5 cards:`, {
        playerName,
        handValue
      });
      player.status = 'stood';
      this.nextTurn();
      return { card, status: 'fiveCards', handValue };
    }

    // Check if player must continue drawing
    const minPoints = playerName === this.dealer.id ? 15 : 16;
    if (handValue < minPoints) {
      console.log(`[drawCard] Player must draw again:`, {
        playerName,
        handValue,
        minPoints
      });
      return { card, status: 'mustDraw', handValue };
    }

    console.log(`[drawCard] Player can decide:`, {
      playerName,
      handValue,
      minPoints
    });
    return { card, status: 'canDecide', handValue };
  }

  stand(playerName) {
    const player = playerName === this.dealer.id ? this.dealer : this.players.get(playerName);
    if (!player || (player.status !== 'playing' && player.status !== 'bust')) return { success: false, reason: 'invalidStatus' };

    // If player is busted or has enough points, allow them to stand
    const handValue = this.calculateHandValue(player.hand);
    const minPoints = playerName === this.dealer.id ? 15 : 16;
    
    if (player.status !== 'bust' && handValue < minPoints) {
      return { success: false, reason: 'notEnoughPoints' };
    }

    // Keep the 'bust' status if player is busted, otherwise set to 'stood'
    if (player.status !== 'bust') {
      player.status = 'stood';
    }
    this.nextTurn();
    return { success: true };
  }

  nextTurn() {
    if (this.state !== 'playing') return;

    // Find next player who can play
    let nextPlayerIndex = this.dealingOrder.indexOf(this.currentTurn) + 1;
    
    // If we've reached the end of players, it's dealer's turn
    if (nextPlayerIndex >= this.dealingOrder.length) {
      if (this.dealer.status === 'waiting') {
        this.currentTurn = this.dealer.id;
        this.dealer.status = 'playing';
        return;
      }
      // If dealer has played (including bust), check if game is over
      if (this.dealer.status === 'bust' || this.dealer.status === 'stood') {
        this.checkGameEnd();
      }
      return;
    }

    // Find next player who hasn't stood or busted
    while (nextPlayerIndex < this.dealingOrder.length) {
      const nextPlayerName = this.dealingOrder[nextPlayerIndex];
      const nextPlayer = this.players.get(nextPlayerName);
      
      if (nextPlayer.status === 'waiting') {
        this.currentTurn = nextPlayerName;
        nextPlayer.status = 'playing';
        return;
      }
      nextPlayerIndex++;
    }

    // If no more players can play, move to dealer
    if (this.dealer.status === 'waiting') {
      this.currentTurn = this.dealer.id;
      this.dealer.status = 'playing';
    } else if (this.dealer.status === 'bust' || this.dealer.status === 'stood') {
      // If dealer has finished (bust or stood), end the game
      this.checkGameEnd();
    }
  }

  checkGameEnd() {
    // Check if all players have finished their turns
    const allPlayersFinished = Array.from(this.players.values())
      .every(player => ['stood', 'bust'].includes(player.status));
    
    if (!allPlayersFinished || !['stood', 'bust'].includes(this.dealer.status)) return false;

    // Game is finished, compare all hands and set results
    this.state = 'finished';
    
    // Set results only for players that haven't been compared yet
    for (const player of this.players.values()) {
      if (player.result === undefined || player.result === null) {
        // Compare hands for players we haven't compared with yet
        const dealerSpecial = this.checkSpecialHand(this.dealer.hand);
        const playerSpecial = this.checkSpecialHand(player.hand);

        let result;
        if (dealerSpecial === 'xiBang' || playerSpecial === 'xiBang') {
          if (dealerSpecial === 'xiBang' && playerSpecial !== 'xiBang') result = 'dealerWin';
          else if (playerSpecial === 'xiBang' && dealerSpecial !== 'xiBang') result = 'playerWin';
          else result = 'tie';
        } else if (dealerSpecial === 'xiDach' || playerSpecial === 'xiDach') {
          if (dealerSpecial === 'xiDach' && playerSpecial !== 'xiDach') result = 'dealerWin';
          else if (playerSpecial === 'xiDach' && dealerSpecial !== 'xiDach') result = 'playerWin';
          else result = 'tie';
        } else {
          // Check for Ngũ Linh
          const dealerNguLinh = this.checkNguLinh(this.dealer.hand);
          const playerNguLinh = this.checkNguLinh(player.hand);

          if (dealerNguLinh || playerNguLinh) {
            if (dealerNguLinh && !playerNguLinh) result = 'dealerWin';
            else if (playerNguLinh && !dealerNguLinh) result = 'playerWin';
            else result = 'tie';
          } else {
            // Normal comparison
            const dealerValue = this.calculateHandValue(this.dealer.hand);
            const playerValue = this.calculateHandValue(player.hand);

            if (dealerValue > 21 && playerValue > 21) result = 'tie';
            else if (dealerValue > 21) result = 'playerWin';
            else if (playerValue > 21) result = 'dealerWin';
            else if (dealerValue > playerValue) result = 'dealerWin';
            else if (dealerValue < playerValue) result = 'playerWin';
            else result = 'tie';
          }
        }

        player.result = result === 'playerWin' ? 'win' : result === 'dealerWin' ? 'lose' : 'tie';
      }
    }

    return true;
  }

  checkNguLinh(hand) {
    return hand && hand.length === 5 && this.calculateHandValue(hand) <= 21;
  }

  compareHands(dealerName, playerName) {
    if (!this.dealer || this.dealer.id !== dealerName) return { success: false, reason: 'notDealer' };
    if (this.state !== 'playing') return { success: false, reason: 'invalidGameState' };
    
    const player = this.players.get(playerName);
    if (!player || !['stood', 'bust'].includes(player.status)) return { success: false, reason: 'playerNotFinished' };

    // Check if dealer's hand value is at least 16
    const dealerValue = this.calculateHandValue(this.dealer.hand);
    if (dealerValue < 16) return { success: false, reason: 'dealerHandTooLow' };

    // Add to revealed players - this makes the hands public
    this.revealedPlayers.add(playerName);

    // Check for special hands first
    const dealerSpecial = this.checkSpecialHand(this.dealer.hand);
    const playerSpecial = this.checkSpecialHand(player.hand);

    let result;
    if (dealerSpecial === 'xiBang' || playerSpecial === 'xiBang') {
      if (dealerSpecial === 'xiBang' && playerSpecial !== 'xiBang') result = 'dealerWin';
      else if (playerSpecial === 'xiBang' && dealerSpecial !== 'xiBang') result = 'playerWin';
      else result = 'tie';
    } else if (dealerSpecial === 'xiDach' || playerSpecial === 'xiDach') {
      if (dealerSpecial === 'xiDach' && playerSpecial !== 'xiDach') result = 'dealerWin';
      else if (playerSpecial === 'xiDach' && dealerSpecial !== 'xiDach') result = 'playerWin';
      else result = 'tie';
    } else {
      // Check for Ngũ Linh
      const dealerNguLinh = this.checkNguLinh(this.dealer.hand);
      const playerNguLinh = this.checkNguLinh(player.hand);

      if (dealerNguLinh || playerNguLinh) {
        if (dealerNguLinh && !playerNguLinh) result = 'dealerWin';
        else if (playerNguLinh && !dealerNguLinh) result = 'playerWin';
        else result = 'tie';
      } else {
        // Normal comparison
        const playerValue = this.calculateHandValue(player.hand);

        if (dealerValue > 21 && playerValue > 21) result = 'tie';
        else if (dealerValue > 21) result = 'playerWin';
        else if (playerValue > 21) result = 'dealerWin';
        else if (dealerValue > playerValue) result = 'dealerWin';
        else if (dealerValue < playerValue) result = 'playerWin';
        else result = 'tie';
      }
    }

    // Set the final result for this player
    player.result = result === 'playerWin' ? 'win' : result === 'dealerWin' ? 'lose' : 'tie';
    
    // Check if all players have been compared
    const allPlayersCompared = Array.from(this.players.values())
      .every(p => p.result !== undefined && p.result !== null);

    if (allPlayersCompared) {
      // End the game if all players have been compared
      this.state = 'finished';
      this.dealer.status = 'stood';
    }
    
    return { success: true, result };
  }

  restartGame() {
    // Reset game state
    this.deck = this.createDeck();
    this.state = 'waiting';
    this.currentTurn = null;
    this.dealingOrder = [];
    this.revealedPlayers = new Set();

    // Reset dealer's state
    this.dealer.hand = [];
    this.dealer.status = 'waiting';

    // Reset all players' states
    for (const player of this.players.values()) {
      player.hand = [];
      player.status = 'waiting';
      player.result = null; // Reset result
    }

    return true;
  }

  getGameState(playerName) {
    console.log('Getting game state for player:', playerName);
    const dealerHandValue = (
      this.state === 'finished' || 
      this.dealer.id === playerName || 
      this.revealedPlayers.size > 0 ||
      (this.state === 'playing' && this.dealer.hand.length > 0)
    ) ? this.calculateHandValue(this.dealer.hand) 
      : null;
    console.log('Dealer hand value:', {
      dealerId: this.dealer.id,
      playerName,
      state: this.state,
      revealedPlayersSize: this.revealedPlayers.size,
      shouldCalculate: this.state === 'finished' || 
                      this.dealer.id === playerName || 
                      this.revealedPlayers.size > 0 ||
                      (this.state === 'playing' && this.dealer.hand.length > 0),
      handValue: dealerHandValue
    });

    const state = {
      roomId: this.roomId,
      state: this.state,
      currentTurn: this.currentTurn,
      dealer: {
        id: this.dealer.id,
        name: this.dealer.name,
        hand: this.dealer.hand || [],
        status: this.dealer.status,
        handValue: dealerHandValue
      },
      players: Object.fromEntries(
        Array.from(this.players.entries()).map(([name, player]) => {
          const playerHandValue = (this.state === 'finished' || name === playerName || this.revealedPlayers.has(name))
            ? this.calculateHandValue(player.hand)
            : null;
          console.log('Player hand value:', {
            playerName: name,
            shouldCalculate: this.state === 'finished' || name === playerName || this.revealedPlayers.has(name),
            handValue: playerHandValue
          });
          return [
            name,
            {
              id: player.id,
              name: player.name,
              hand: player.hand || [],
              status: player.status,
              handValue: playerHandValue,
              result: player.result || player.tempResult || null
            }
          ];
        })
      ),
      // Add a flag to indicate if all cards should be shown
      showAllCards: this.state === 'finished',
      // Convert revealedPlayers Set to an object for consistent handling
      revealedPlayers: Object.fromEntries(
        Array.from(this.revealedPlayers).map(name => [name, true])
      )
    };
    console.log('Game state:', JSON.stringify(state, null, 2));
    return state;
  }
}

module.exports = Game; 