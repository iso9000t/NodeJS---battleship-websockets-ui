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

  const attackResult = determineAttackResult(x, y, game, indexPlayer);

  const feedback = {
    type: 'attack',
    data: JSON.stringify({
      position: { x, y },
      currentPlayer: game.currentTurnPlayerIndex,
      status: attackResult.status,
    }),
    id: 0,
  };

  wsClient.send(JSON.stringify(feedback));

  function updateGameState(game, attackResult) {
    const currentPlayerIndex = game.currentTurnPlayerIndex;
    const nextPlayerIndex = game.players.find(
      (player) => player.index !== currentPlayerIndex
    ).index;
    game.currentTurnPlayerIndex = nextPlayerIndex;

    // Check if the game is over
    const isGameOver = checkGameOver(game);
    let winner = null;
    if (isGameOver) {
      winner = game.players.find(
        (player) => !isAllShipsSunk(game, player.index)
      );
      game.winner = winner ? winner.index : null;
    }

    database.updateGame(game);

    notifyPlayers(game, attackResult, isGameOver, winner);

    if (isGameOver) {
      handleGameOver(game);
    }
  }

  function notifyPlayers(game, attackResult, isGameOver, winner) {
    game.players.forEach((player) => {
      const client = database.getConnectionByPlayerIndex(player.index);
      if (client) {
        client.send(
          JSON.stringify({
            type: 'update_game_state',
            data: JSON.stringify({
              attackResult,
              nextPlayerIndex: game.currentTurnPlayerIndex,
              gameOver: isGameOver,
              winner: winner ? winner.index : null,
            }),
            id: 0,
          })
        );
      }
    });
  }

  function handleGameOver(game) {
    console.log(`Game over! Winner: ${game.winner}`);
  }

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
}

// Mock function to determine the result of an attack
function determineAttackResult(
  x: number,
  y: number,
  game: Game,
  indexPlayer: number | string
): { status: AttackStatus } {
  // Find the opponent based on indexPlayer
  const opponentIndex = game.players.findIndex(
    (player) => player.index !== indexPlayer
  );

  const opponent = game.players[opponentIndex];
  const opponentBoard = game.boards.get(opponent.index);
  if (opponentBoard) {
    console.log(
      `Ship data for player ${opponentIndex} at the time of attack:`,
      opponentBoard.ships
    );
  }

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
  return positions.some((position) => position.x === x && position.y === y);
}

function calculateShipPositions(ship: Ship): { x: number; y: number }[] {
  const positions = [];
  for (let i = 0; i < ship.length; i++) {
    positions.push({
      x: ship.direction ? ship.position.x + i : ship.position.x,
      y: ship.direction ? ship.position.y : ship.position.y + i,
    });
  }
  return positions;
}

function checkGameOver(game) {
  // A simple game over check could just see if any player has all ships sunk
  return game.players.some((player) => isAllShipsSunk(game, player.index));
}

function isAllShipsSunk(game, playerIndex) {
  const board = game.boards.get(playerIndex);
  if (!board) return false;

  return board.ships.every((ship) => isShipKilled(ship, board));
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
      const attackIndex = board.attacks.findIndex(
        (attack) => attack.x === position.x && attack.y === position.y
      );
      if (attackIndex !== -1)
        board.attacks[attackIndex].status = AttackStatus.killed;
    }
  });
}
