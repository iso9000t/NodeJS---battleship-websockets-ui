import { WebSocketServer } from 'ws';
import { database } from '../database/database';
import { CommandType, Command } from '../models/models';

export function updateRoom(wss: WebSocketServer) {
  // Fetch the current state of all rooms from the database
  const rooms = database.getRooms();

  // Transform the rooms data to match the expected format
  const roomsInfo = rooms.map((room) => ({
    roomId: room.roomId,
    roomUsers: room.players.map((player) => ({
      name: player.name,
      index: player.index,
      // Exclude password and wins from the response
    })),
  }));

  // Prepare the command to be sent to all connected clients
  const response: Command = {
    type: CommandType.updateRoom,
    data: JSON.stringify(roomsInfo), // Serialize the transformed rooms information
    id: 0,
  };

  console.log('Sending update_room to all clients:', response);

  // Iterate over all connected clients and send them the updated rooms information
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      // Use numeric value for the WebSocket.OPEN state
      client.send(JSON.stringify(response));
    }
  });
}
