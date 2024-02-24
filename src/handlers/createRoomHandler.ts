import {  WebSocketServer } from 'ws';
import { database } from '../database/database';
import { Command, CommandType, WebSocketClient } from '../models/models';
import { updateRoom } from './updateRoomHandler';

export function handleCreateRoom(
  wsClient: WebSocketClient,
  command: Command,
  wss: WebSocketServer
) {
  console.log('Received create room command:', command);

  const player = database.findPlayerByConnection(wsClient);
  if (!player) {
    wsClient.send(JSON.stringify({ error: 'Player not found' }));
    return;
  }

  const room = database.createRoom(player);
  console.log('New room created:', room);

  const response: Command = {
    type: CommandType.createRoom,
    data: JSON.stringify({
      roomId: room.roomId,
      message: 'Room created successfully',
    }),
    id: 0,
  };
  wsClient.send(JSON.stringify(response));

  // Call updateRoom to broadcast the updated room list
  updateRoom(wss);
}
