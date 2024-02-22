import { WebSocketServer } from 'ws';
import { handleCommand } from '../controller/handleCommand';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws) => {
  console.log('Client connected.');

  ws.on('message', (message) => {
    handleCommand(ws, message);
  });

  ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
});

console.log('WebSocket server started on ws://localhost:3000');
