import { WebSocketServer } from 'ws';
import { handleCommand } from '../controller/handleCommand';
import { WebSocketClient } from '../models/models'; // Ensure this path is correct

const wsPort = process.env.WS_PORT || 3000;

export const wss = new WebSocketServer({ port: Number(wsPort) });

wss.on('connection', (ws) => {
  // Cast the connection to WebSocketClient right away
  const wsClient: WebSocketClient = ws as unknown as WebSocketClient;
  wsClient.index = -1; // Placeholder value until properly set
  wsClient.name = ''; // Placeholder value until properly set

  console.log('Client connected.');

  ws.on('message', (message) => {
    const messageAsString = message.toString();
    handleCommand(wsClient, messageAsString, wss);
  });

});
