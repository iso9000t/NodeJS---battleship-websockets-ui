import { WebSocket, WebSocketServer } from 'ws';
import { database } from '../database/database';
import { Command, CommandType } from '../models/models';
import { updateRoom } from './updateRoomHandler'; // Adjust the import path as necessary

// Adjust the function signature to include the WebSocketServer instance
export function handleCreateRoom(
  ws: WebSocket,
  command: Command,
  wss: WebSocketServer
) {
  console.log('Received create room command:', command);

  const player = database.findPlayerByConnection(ws);
  if (!player) {
    ws.send(JSON.stringify({ error: 'Player not found' }));
    return;
  }

  const room = database.createRoom(player);
  console.log('New room created:', room);

  const response: Command = {
    type: CommandType.create_room,
    data: JSON.stringify({
      roomId: room.roomId,
      message: 'Room created successfully',
    }),
    id: 0,
  };
  ws.send(JSON.stringify(response));

  // Call updateRoom to broadcast the updated room list
  updateRoom(wss);
}
