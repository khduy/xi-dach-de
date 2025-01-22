# Xì Dách Game

A multiplayer Vietnamese card game implementation using React and Socket.IO.

## Development Setup

1. Clone the repository
2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Start the development servers:
```bash
# Start server (in server directory)
npm start

# Start client (in client directory)
npm start
```

## Deployment

The game can be deployed using Render.com's free tier:

1. Fork this repository to your GitHub account

2. Create a new Render.com account at https://render.com

3. In Render dashboard:
   - Click "New +"
   - Select "Blueprint"
   - Connect your GitHub repository
   - Click "Connect"

4. Render will automatically:
   - Deploy the server as a Web Service
   - Deploy the client as a Static Site
   - Configure environment variables
   - Set up the connection between client and server

5. Once deployed, you can access the game at the client URL provided by Render

## Environment Variables

### Server (.env)
```
PORT=5000
CLIENT_URL=http://localhost:3000 # In development
NODE_ENV=development
```

### Client (.env)
```
REACT_APP_SERVER_URL=http://localhost:5000 # In development
NODE_ENV=development
```

## Playing the Game

1. Share the deployed client URL with players
2. Create a room as the dealer
3. Share the room code with other players
4. Players join using the room code
5. Start playing! 