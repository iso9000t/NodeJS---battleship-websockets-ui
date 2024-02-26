import { WebSocketServer } from 'ws';
import { database } from '../database/database';
import { Command, CommandType, WebSocketClient } from '../models/commonModels';
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

  const joinResponse: Command = {
    type: CommandType.addUserToRoom,
    data: JSON.stringify({
      message: 'Joined room successfully',
      roomId: room.roomId,
    }),
    id: 0,
  };
  wsClient.send(JSON.stringify(joinResponse));

  if (room.players.length === 2) {
    const game = database.createGameSession(room);

    room.players.forEach((player) => {
      const playerWsClient = database.connections.get(player.index);
      if (playerWsClient) {
        const gameStartResponse: Command = {
          type: 'create_game',
          data: JSON.stringify({
            idGame: game.gameId,
            idPlayer: player.index,
          }),
          id: 0,
        };
        playerWsClient.send(JSON.stringify(gameStartResponse));
      }
    });
  }

  updateRoom(wss);
}
