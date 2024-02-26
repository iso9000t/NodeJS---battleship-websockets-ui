import { WebSocketServer } from 'ws';
import { database } from '../database/database';
import { CommandType, Command } from '../models/commonModels';

export function updateRoom(wss: WebSocketServer) {
  const rooms = database.getRooms();

  const roomsInfo = rooms.map((room) => ({
    roomId: room.roomId,
    roomUsers: room.players.map((player) => ({
      name: player.name,
      index: player.index,
    })),
  }));

  const response: Command = {
    type: CommandType.updateRoom,
    data: JSON.stringify(roomsInfo),
    id: 0,
  };

  console.log('Sending update_room to all clients:', response);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(response));
    }
  });
}
