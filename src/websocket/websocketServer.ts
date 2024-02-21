import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws) => {
  console.log('A client connected to the WebSocket server.');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    //  Handle incoming messages, e.g., player actions
  });

  // Send a welcome message or any other notifications as needed
  ws.send(
    JSON.stringify({ message: 'Welcome to the Battleship WebSocket server!' })
  );
});

console.log('WebSocket server started on ws://localhost:3000');
