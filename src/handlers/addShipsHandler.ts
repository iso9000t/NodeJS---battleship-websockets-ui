// handlers/addShipsHandler.ts

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

  // Assuming you have a way to get a player's board by their index or ID
  // Correctly initialize a board with both ships and attacks arrays if it doesn't exist
  const defaultBoard: Board = { ships: [], attacks: [] };
  const board = game.boards.get(indexPlayer) || defaultBoard;
  board.ships = ships; // Replace with the new ships
  game.boards.set(indexPlayer, board);

  database.updateGame(game); // Update the game with the new board state

  // Acknowledge the ships were added
  wsClient.send(
    JSON.stringify({
      type: 'add_ships',
      data: JSON.stringify({ message: 'Ships added successfully' }),
      id: 0,
    })
  );

  // Check if both players have added their ships and start the game if so
  if (gameIsReadyToStart(game)) {
    startGame(game, wss); // Start the game
  }
}

function gameIsReadyToStart(game: Game): boolean {
  // Check if the number of boards equals the number of players in the game
  // This means all players have submitted their ships
  return game.boards.size === game.players.length;
}

function startGame(game: Game, wss: WebSocketServer) {
  // Randomly select who starts to ensure fairness
  const startingPlayerIndex = Math.floor(Math.random() * game.players.length);
  const startingPlayerId = game.players[startingPlayerIndex].index;
  game.currentTurnPlayerIndex = startingPlayerId; // Update game with the index of the player who starts

  database.updateGame(game); // Update the game state in the database

  // Notify each player about the start of the game and send them their ships
  game.players.forEach((player) => {
    const wsClient = database.getConnectionByPlayerIndex(player.index);
    if (wsClient) {
      const playerShips = game.boards.get(player.index);
      const startGameCommand = {
        type: 'start_game',
        data: JSON.stringify({
          ships: playerShips ? playerShips.ships : [], // Send the player their own ships
          currentPlayerIndex: startingPlayerId, // Notify who will start
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

  // Optionally, send the first "turn" command to the starting player
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
