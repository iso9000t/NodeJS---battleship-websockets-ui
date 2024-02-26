import { WebSocketServer, WebSocket } from 'ws';
import { database } from '../database/database';
import { Command, CommandType } from '../models/commonModels';

export function updateWinners(wss: WebSocketServer) {
  const winnersData = database.winners.map((winner) => ({
    name: winner.name,
    wins: winner.wins,
  }));

  const response: Command = {
    type: CommandType.updateWinners,
    data: JSON.stringify(winnersData),
    id: 0,
  };

  console.log('Sending update_winners to all clients:', response);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(response));
    }
  });
}
