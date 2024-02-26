/* // handlers/randomAttackHandler.ts

import { WebSocketServer } from 'ws';
import { database } from '../database/database';
import { Game } from '../database/models';
import { WebSocketClient, Command } from '../models/models';
import { performAttack, updateTurn } from './attackHandler';

export function handleRandomAttack(
  wsClient: WebSocketClient,
  command: Command,
  wss: WebSocketServer
) {
  const { gameId, indexPlayer } = JSON.parse(command.data);
  const game: Game | undefined = database.getGameById(gameId);

  if (!game) {
    wsClient.send(JSON.stringify({ error: 'Game not found' }));
    return;
  }

  // Generate random x, y coordinates for the attack
  const { x, y } = generateRandomCoordinates();

  // Use the same performAttack function from the attack handler
  const attackResult = performAttack(game, x, y, indexPlayer);

  // Send the attack result to both players
  game.players.forEach((player) => {
    const playerClient = database.getConnectionByPlayerIndex(player.index);
    if (playerClient) {
      playerClient.send(
        JSON.stringify({
          type: 'attack',
          data: JSON.stringify(attackResult),
          id: 0,
        })
      );
    }
  });

  // Optionally, update the turn
  updateTurn(game, wss);
}

function generateRandomCoordinates(): { x: number; y: number } {
  // Generate and return random coordinates
  const x = Math.floor(Math.random() * 10); // Assuming a 10x10 board
  const y = Math.floor(Math.random() * 10);
  return { x, y };
}
 */