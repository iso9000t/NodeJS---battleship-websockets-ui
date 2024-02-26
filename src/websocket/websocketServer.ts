import { WebSocketServer } from 'ws';
import { handleCommand } from '../controller/handleCommand';
import { WebSocketClient } from '../models/commonModels';
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
    if (wsClient.index !== -1) {
      database.handlePlayerDisconnect(wsClient.index);
    }
    database.removePlayerRooms(wsClient.index);
    updateRoom(wss);
    updateWinners(wss);
    console.log('the winner is ', database.winners);
  });
});
