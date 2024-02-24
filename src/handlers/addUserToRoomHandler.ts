import { WebSocketServer } from 'ws';
import { database } from '../database/database';
import { Command, CommandType, WebSocketClient } from '../models/models';
import { updateRoom } from './updateRoomHandler';


export function handleAddUserToRoom(
  wsClient: WebSocketClient,
  command: Command,
  wss: WebSocketServer
) {
  const { indexRoom } = JSON.parse(command.data);
  const player = database.findPlayerByConnection(wsClient);
  if (!player) {
    wsClient.send(JSON.stringify({ error: 'Player not found' }));
    return;
  }

  const room = database.addUserToRoom(player, indexRoom);
  if (!room) {
    wsClient.send(JSON.stringify({ error: 'Failed to join room' }));
    return;
  }

  console.log(`Player ${player.name} added to room: ${indexRoom}`);

  // Notify the user that they've successfully joined the room
  const response: Command = {
    type: CommandType.addUserToRoom,
    data: JSON.stringify({
      message: 'Joined room successfully',
      roomId: room.roomId,
    }),
    id: 0,
  };
  wsClient.send(JSON.stringify(response));

  // Update all clients about the room state change
  updateRoom(wss);
}
