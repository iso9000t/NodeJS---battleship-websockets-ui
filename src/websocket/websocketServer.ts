import { WebSocketServer } from 'ws';
import { handleCommand } from '../controller/handleCommand';
import { WebSocketClient } from '../models/commonModels'; // Ensure this path is correct
import { database } from '../database/database';
import { updateRoom } from '../handlers/updateRoomHandler';
import { updateWinners } from '../handlers/updateWinners';

const wsPort = process.env.WS_PORT || 3000;

export const wss = new WebSocketServer({ port: Number(wsPort) });

wss.on('connection', (ws) => {
  const wsClient: WebSocketClient = ws as unknown as WebSocketClient;
  wsClient.index = -1;
  wsClient.name = '';

  ws.on('message', (message) => {
    const messageAsString = message.toString();
    handleCommand(wsClient, messageAsString, wss);
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${wsClient.name}`);
    // Check if the player was part of a game and handle the disconnection
    if (wsClient.index !== -1) {
      // Ensure the client was registered
      database.handlePlayerDisconnect(wsClient.index);
    }
    database.removePlayerRooms(wsClient.index);
    updateRoom(wss); // Make sure to import updateRoom
    updateWinners(wss);
    console.log('the winner is ',database.winners);
  });
});
