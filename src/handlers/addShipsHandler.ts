import { WebSocketServer } from 'ws';
import { database } from '../database/database';
import { Game, Board } from '../database/models';
import { Command, WebSocketClient } from '../models/commonModels';

export function handleAddShips(
  wsClient: WebSocketClient,
  command: Command,
  wss: WebSocketServer
) {
  console.log('Received add_ships command:', command);
  const { gameId, ships, indexPlayer } = JSON.parse(command.data);

  const game: Game | undefined = database.getGameById(gameId);
  if (!game) {
    wsClient.send(JSON.stringify({ error: 'Game not found' }));
    return;
  }

  const defaultBoard: Board = { ships: [], attacks: [] };
  const board = game.boards.get(indexPlayer) || defaultBoard;
  board.ships = ships;
  game.boards.set(indexPlayer, board);

  database.updateGame(game);

  wsClient.send(
    JSON.stringify({
      type: 'add_ships',
      data: JSON.stringify({ message: 'Ships added successfully' }),
      id: 0,
    })
  );

  if (gameIsReadyToStart(game)) {
    startGame(game, wss);
  }
}

function gameIsReadyToStart(game: Game): boolean {
  return game.boards.size === game.players.length;
}

function startGame(game: Game, wss: WebSocketServer) {
  const startingPlayerIndex = Math.floor(Math.random() * game.players.length);
  const startingPlayerId = game.players[startingPlayerIndex].index;
  game.currentTurnPlayerIndex = startingPlayerId;

  database.updateGame(game);

  game.players.forEach((player) => {
    const wsClient = database.getConnectionByPlayerIndex(player.index);
    if (wsClient) {
      const playerShips = game.boards.get(player.index);
      const startGameCommand = {
        type: 'start_game',
        data: JSON.stringify({
          ships: playerShips ? playerShips.ships : [],
          currentPlayerIndex: startingPlayerId,
        }),
        id: 0,
      };
      console.log(
        `Sending start_game to player ${player.index}:`,
        startGameCommand
      );
      wsClient.send(JSON.stringify(startGameCommand));
    }
  });

  const wsClientStartingPlayer = database.getConnectionByPlayerIndex(
    game.currentTurnPlayerIndex
  );
  if (wsClientStartingPlayer) {
    const turnCommand = {
      type: 'turn',
      data: JSON.stringify({ currentPlayer: game.currentTurnPlayerIndex }),
      id: 0,
    };
    wsClientStartingPlayer.send(JSON.stringify(turnCommand));
  }
}
