import { WebSocketServer, WebSocket } from 'ws';
import { database } from '../database/database';
import { Command, CommandType } from '../models/commonModels';


export function updateWinners(wss: WebSocketServer) {
  // Directly use the winners array from the database
  const winnersData = database.winners.map((winner) => ({
    name: winner.name,
    wins: winner.wins,
  }));

  // Prepare the command to be sent to all connected clients
  const response: Command = {
    type: CommandType.updateWinners,
    data: JSON.stringify(winnersData), // Serialize the winners data
    id: 0,
  };

  console.log('Sending update_winners to all clients:', response);

  // Iterate over all connected clients and send them the updated winners information
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(response));
    }
  });
}

