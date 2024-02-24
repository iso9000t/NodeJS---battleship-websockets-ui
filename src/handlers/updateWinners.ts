import { WebSocketServer, WebSocket } from 'ws';
import { database } from '../database/database';


export function updateWinners(wss: WebSocketServer) {
  const winners = database.getWinners(); // Or database.getPlayers() if you're not filtering by wins

  const message = JSON.stringify({
    type: 'update_winners',
    data: JSON.stringify(
      winners.map((winner) => ({
        name: winner.name,
        wins: winner.wins,
      }))
    ),
    id: 0,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
