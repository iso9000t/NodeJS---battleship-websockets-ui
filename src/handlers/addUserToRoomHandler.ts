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
  const joinResponse: Command = {
    type: CommandType.addUserToRoom,
    data: JSON.stringify({
      message: 'Joined room successfully',
      roomId: room.roomId,
    }),
    id: 0,
  };
  wsClient.send(JSON.stringify(joinResponse));

  // If the room is now full, create a game session and notify both players
  if (room.players.length === 2) {
    const game = database.createGameSession(room);

    // Notify both players in the room about the game start
    room.players.forEach((player) => {
      const playerWsClient = database.connections.get(player.index);
      if (playerWsClient) {
        const gameStartResponse: Command = {
          type: 'create_game',
          data: JSON.stringify({
            idGame: game.gameId,
            idPlayer: player.index, // Player's own ID
          }),
          id: 0,
        };
        playerWsClient.send(JSON.stringify(gameStartResponse));
      }
    });
  }

  // Update all clients about the room state change
  updateRoom(wss);
}
