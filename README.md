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

## Deployment (Free Tier)

### Deploy Server (Render.com)

1. Create a Render.com account at https://render.com
2. From your dashboard, click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: xidach-server
   - Environment: Node
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Add environment variables:
     - PORT: 10000
     - NODE_ENV: production
     - CLIENT_URL: https://{username}.github.io/xi-dach-de (replace {username} with your GitHub username)

### Deploy Client (GitHub Pages)

1. In the client/package.json file, update the "homepage" field with your GitHub username:
   ```json
   "homepage": "https://{username}.github.io/xi-dach-de"
   ```

2. Install GitHub Pages package:
   ```bash
   cd client
   npm install gh-pages --save-dev
   ```

3. Add your Render.com server URL to client/.env.production:
   ```
   REACT_APP_SERVER_URL=https://xidach-server.onrender.com
   ```

4. Deploy to GitHub Pages:
   ```bash
   cd client
   npm run deploy
   ```

5. Enable GitHub Pages:
   - Go to your repository settings
   - Scroll to "GitHub Pages" section
   - Select "gh-pages" branch as source
   - Save the changes

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

1. Share your GitHub Pages URL with players
2. Create a room as the dealer
3. Share the room code with other players
4. Players join using the room code
5. Start playing! 