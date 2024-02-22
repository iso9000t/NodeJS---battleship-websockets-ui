import { WebSocketServer } from 'ws';
import { handleCommand } from '../controller/handleCommand';

const wsPort = process.env.WS_PORT || 3000;

export const wss = new WebSocketServer({ port: Number(wsPort) });

wss.on('connection', (ws) => {
  console.log('Client connected.');

  ws.on('message', (data) => {
    const message = data.toString();
    handleCommand(ws, message);
  });

  ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' }));
});

