import { WebSocketServer } from 'ws';
import { database } from '../database/database';
import { Command, WebSocketClient, AttackStatus } from '../models/commonModels';
import { Board, Game, Ship } from '../database/models';

export function handleAttack(
  wsClient: WebSocketClient,
  command: Command,
  wss: WebSocketServer
) {
  const { gameId, x, y, indexPlayer } = JSON.parse(command.data);

  const game = database.getGameById(gameId);
  if (!game) {
    wsClient.send(JSON.stringify({ error: 'Game not found' }));
    return;
  }

  // Mocking the attack result determination
  const attackResult = determineAttackResult(x, y, game, indexPlayer);

  // Update the game state based on the attack result
  updateGameState(game, attackResult);

  // Send the attack result to the player
  wsClient.send(
    JSON.stringify({
      type: 'attack',
      data: JSON.stringify({
        position: { x, y },
        currentPlayer: indexPlayer, // Assuming the turn changes after the attack
        status: attackResult.status,
      }),
      id: 0,
    })
  );

  // Additional logic to notify the other player, update turns, etc., goes here
}

// Mock function to determine the result of an attack
function determineAttackResult(x: number, y: number, game: Game, indexPlayer: number | string): { status: AttackStatus } {
  // Find the opponent based on indexPlayer
  const opponentIndex = game.players.findIndex(player => player.index !== indexPlayer);
  const opponent = game.players[opponentIndex];
  const opponentBoard = game.boards.get(opponent.index);

  if (!opponentBoard) {
    console.log('No opponent board found');
    return { status: AttackStatus.miss };
  }

  let hitShip: Ship | undefined = undefined;

  // Check if the attack hits any ship
  for (const ship of opponentBoard.ships) {
    if (isShipHit(x, y, ship)) {
      hitShip = ship;
      break; // Exit loop once a hit is detected
    }
  }

  if (hitShip) {
    // Record the hit
    opponentBoard.attacks.push({ x, y, status: AttackStatus.shot });
    const isKilled = isShipKilled(hitShip, opponentBoard);
    if (isKilled) {
      // If ship is killed, update status for all ship positions
      markShipKilled(hitShip, opponentBoard);
      return { status: AttackStatus.killed };
    }
    return { status: AttackStatus.shot };
  } else {
    // Record the miss
    opponentBoard.attacks.push({ x, y, status: AttackStatus.miss });
    return { status: AttackStatus.miss };
  }
}


function isShipHit(x: number, y: number, ship: Ship): boolean {
  const positions = calculateShipPositions(ship);
  return positions.some(position => position.x === x && position.y === y);
}

function calculateShipPositions(ship: Ship): {x: number, y: number}[] {
  const positions = [];
  for (let i = 0; i < ship.length; i++) {
    positions.push({
      x: ship.direction ? ship.position.x + i : ship.position.x,
      y: ship.direction ? ship.position.y : ship.position.y + i
    });
  }
  return positions;
}



// Mock function to update the game state
function updateGameState(game, attackResult) {
  // Placeholder: Implement game state update logic
}



function isShipKilled(ship: Ship, board: Board): boolean {
  const positions = calculateShipPositions(ship);
  return positions.every((position) =>
    board.attacks.some(
      (attack) =>
        attack.x === position.x &&
        attack.y === position.y &&
        attack.status === AttackStatus.shot
    )
  );
}

export function markShipKilled(ship: Ship, board: Board): void {
  const positions = calculateShipPositions(ship);
  positions.forEach((position) => {
    if (
      !board.attacks.some(
        (attack) => attack.x === position.x && attack.y === position.y
      )
    ) {
      board.attacks.push({
        x: position.x,
        y: position.y,
        status: AttackStatus.killed,
      });
    } else {
      // Update existing attack status to killed if it was previously marked as a shot
      const attackIndex = board.attacks.findIndex(
        (attack) => attack.x === position.x && attack.y === position.y
      );
      if (attackIndex !== -1)
        board.attacks[attackIndex].status = AttackStatus.killed;
    }
  });
}


