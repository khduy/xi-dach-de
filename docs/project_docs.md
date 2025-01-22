# Project Documentation

## Components Created

### Server Components

1. Basic Express + Socket.IO server setup (`server/src/index.js`)
   - Express server with CORS middleware
   - Socket.IO integration with CORS configuration
   - Game state management:
     - Room management with Map
     - Player tracking with Map
   - Socket.IO event handlers:
     - Room management:
       - `createRoom`: Create a new game room
       - `joinRoom`: Join an existing room
     - Game actions:
       - `startGame`: Begin the game (dealer only)
       - `drawCard`: Draw a card on player's turn
       - `stand`: Stand with current hand
       - `compareHands`: Compare dealer's hand with a player's (dealer only)
     - Event notifications:
       - `roomCreated`: New room created
       - `playerJoined`: Player joined the room
       - `gameStarted`: Game has begun
       - `cardDrawn`: Card was drawn
       - `playerStood`: Player has stood
       - `handsCompared`: Hands were compared
       - `gameCancelled`: Game ended prematurely
       - `playerLeft`: Player disconnected
       - `error`: Error notifications

2. Game Logic Class (`server/src/game/Game.js`)
   - Core game mechanics implementation:
     - Deck creation and shuffling
     - Player management
     - Hand value calculation
     - Special hand detection (Xì Bàng, Xì Dách)
     - Initial card dealing logic
   - Advanced game mechanics:
     - Player turn management
     - Card drawing with validation
     - Standing with minimum points validation
     - Special hand comparisons (Xì Bàng, Xì Dách, Ngũ Linh)
     - Game state tracking and visibility rules
     - Win condition checking

### Client Components

1. Main Application (`client/src/App.jsx`)
   - Socket.IO connection management
   - Game state management
   - Room creation/joining flow
   - Error handling and notifications
   - Component orchestration
   - Enhanced UI with animations and transitions
   - Responsive design with modern aesthetics

2. Game Interface Components:
   - `Card.jsx`: Individual playing card display
     - Modern card design with gradients
     - Hover animations and transitions
     - Interactive feedback
     - Fade-in animations
     - Custom font integration
     - Shadow effects and visual depth
   - `PlayerHand.jsx`: Player's cards and status
     - Card collection display
     - Player status indication
     - Score display when revealed
     - Animated transitions
   - `GameTable.jsx`: Main game interface
     - Dealer and player hands layout
     - Action buttons (Draw, Stand)
     - Turn indication
     - Hand comparison controls
     - Enhanced visual feedback

3. Room Management Components:
   - `RoomCreation.jsx`: Create new game rooms
     - Dealer name input
     - Form validation
     - Interactive feedback
   - `RoomJoining.jsx`: Join existing rooms
     - Room ID and player name inputs
     - Input validation
     - Error handling
     - Visual feedback

### UI/UX Features

1. Visual Design
   - Modern gradient backgrounds
   - Depth with layered shadows
   - Smooth transitions and animations
   - Interactive hover effects
   - Consistent color scheme
   - Custom typography

2. Animations
   - Card flip animations
   - Hand transitions
   - Result animations
   - Button hover effects
   - Loading states

3. Accessibility
   - High contrast colors
   - Clear visual hierarchy
   - Keyboard navigation
   - Screen reader support
   - Focus indicators

### Testing

1. Unit Tests (`server/src/game/__tests__/Game.test.js`)
   - Game initialization tests:
     - Initial state verification
     - Deck creation and shuffling
   - Player management tests:
     - Adding players
     - Player limit enforcement
   - Card dealing tests:
     - Initial card distribution
     - State validation
   - Hand calculation tests:
     - Numeric cards
     - Face cards
     - Ace value flexibility
   - Special hand detection tests:
     - Xì Bàng (Two Aces)
     - Xì Dách (Ace + 10)
     - Ngũ Linh (Five cards)
   - Game flow tests:
     - Turn management
     - Game state transitions
   - Hand comparison tests:
     - Special hand precedence
     - Normal hand comparison
     - Bust cases

### Configuration

1. Environment Configuration (`server/.env`)
   - Server port configuration
   - Client URL for CORS
   - Node environment setting

2. Testing Configuration (`server/jest.config.js`)
   - Node environment setup
   - Test pattern matching
   - Coverage reporting
   - Verbose output

## Implementation Details

### Game States
- `waiting`: Room created, waiting for players
- `dealing`: Initial cards being dealt
- `playing`: Game in progress
- `finished`: Game ended, results available

### Player Status
- `waiting`: Not yet their turn
- `playing`: Currently their turn
- `stood`: Finished playing, standing
- `bust`: Exceeded 21 points

### Special Hands (in order of precedence)
1. Xì Bàng (Two Aces)
2. Xì Dách (Ace + 10-value card)
3. Ngũ Linh (Five cards totaling ≤ 21)

### Socket.IO Events
1. Room Events:
   - `createRoom`: Create a new game room with the creator as dealer
   - `joinRoom`: Join an existing room as a player
   - `roomCreated`: Notification of successful room creation
   - `playerJoined`: Notification when a new player joins

2. Game Events:
   - `startGame`: Start the game (dealer only)
   - `gameStarted`: Notification that the game has started
   - `drawCard`: Request to draw a card
   - `cardDrawn`: Notification of card being drawn
   - `stand`: Request to stand
   - `playerStood`: Notification of player standing
   - `compareHands`: Request to compare hands (dealer only)
   - `handsCompared`: Results of hand comparison

3. System Events:
   - `disconnect`: Player disconnection
   - `gameCancelled`: Game ended due to dealer leaving
   - `playerLeft`: Player left the game
   - `error`: Error notifications

## Next Steps

1. Additional Testing:
   - Integration tests for Socket.IO events
   - End-to-end testing with Cypress
   - Client component testing with React Testing Library

2. Enhancements:
   - Add sound effects for card actions
   - Implement animations for card dealing
   - Add player avatars
   - Include game statistics
   - Add chat functionality

3. Performance Improvements:
   - Implement caching for game states
   - Optimize Socket.IO event handling
   - Add error recovery mechanisms

## Mobile Responsiveness
The game UI has been optimized for mobile devices with the following features:
- Responsive card sizes that adapt to screen width
- Touch-optimized scrolling for card hands
- Scroll snapping for better card navigation
- Reduced spacing and typography sizes on mobile
- Full-width containers on small screens
- Improved touch targets and interactions

The responsive breakpoints follow Material-UI's default breakpoints:
- xs: 0-600px (mobile)
- sm: 600px+ (tablet/desktop)
