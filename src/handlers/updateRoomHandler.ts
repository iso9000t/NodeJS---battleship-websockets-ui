import { WebSocketServer, WebSocket } from 'ws';
import { database } from '../database/database';
import { CommandType, Command } from '../models/models';

export function updateRoom(wss: WebSocketServer) {
  const roomsInfo = database.getRooms();
  const response: Command = {
    type: CommandType.update_room,
    data: JSON.stringify(roomsInfo),
    id: 0,
  };

  console.log('Sending update_room to all clients:', response);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(response));
    }
  });
}
