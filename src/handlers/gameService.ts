import { WebSocketServer } from 'ws';
import { database } from '../database/database';
import { WebSocketClient } from '../models/commonModels';

export class GameService {
  static switchTurn(gameId: number, wss: WebSocketServer) {
    const game = database.getGameById(gameId);
    if (!game) {
      console.error('Game not found');
      return;
    }

    game.currentTurnPlayerIndex =
      (game.currentTurnPlayerIndex + 1) % game.players.length;
    database.updateGame(game);

    game.players.forEach((player) => {
      const wsClient = database.getConnectionByPlayerIndex(player.index);
      if (wsClient) {
        this.notifyPlayerOfTurn(wsClient, game.currentTurnPlayerIndex);
      }
    });
  }

  static notifyPlayerOfTurn(
    wsClient: WebSocketClient,
    currentPlayerIndex: number
  ) {
    const message = {
      type: 'turn',
      data: JSON.stringify({ currentPlayerIndex }),
      id: 0,
    };
    wsClient.send(JSON.stringify(message));
  }
}
