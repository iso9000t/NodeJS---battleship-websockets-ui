
import { WebSocketClient } from '../models/commonModels';
import { Player, Room, Game, Board, Winner } from './models';
import { WebSocket } from 'ws';


class Database {
  private players: Player[] = [];
  private rooms: Room[] = [];
  private games: Game[] = [];
  private nextRoomId: number = 0;
  private nextGameId: number = 0;
  winners: Winner[];
  connections: Map<number, WebSocketClient> = new Map();

  constructor() {
    // Your constructor code, if any
    // Initialize your properties here if not using class field syntax
    this.players = [];
    this.rooms = [];
    this.games = [];
    this.nextRoomId = 0;
    this.nextGameId = 0;
    this.connections = new Map();
    // Ensure winners is initialized if not already done so at the top level
    this.winners = [];
  }

  // Player management
  addPlayer(name: string, password: string): Player {
    const newIndex = this.players.length
      ? Math.max(...this.players.map((p) => p.index)) + 1
      : 1;
    const player: Player = {
      name,
      password,
      index: newIndex,
      wins: 0,
    };
    this.players.push(player);
    return player;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getWinners(): Player[] {
    return this.players.filter((player) => player.wins > 0);
  }

  findPlayerByName(name: string): Player | undefined {
    return this.players.find((player) => player.name === name);
  }

  findPlayerByIndex(index: number): Player | undefined {
    return this.players.find((player) => player.index === index);
  }

  linkConnectionToPlayer(wsClient: WebSocketClient, index: number): void {
    this.connections.set(index, wsClient);
  }

  findPlayerByConnection(wsClient: WebSocketClient): Player | undefined {
    return this.players.find((player) => player.index === wsClient.index);
  }

  // Room management
  createRoom(player: Player): Room | undefined {
    // Check if the player already has a room
    const existingRoom = this.rooms.find((room) =>
      room.players.some((p) => p.index === player.index)
    );

    if (existingRoom) {
      console.log(`Player ${player.name} already has a created room.`);
      // Optionally, return the existing room or handle differently
      return existingRoom;
    } else {
      const room: Room = { roomId: this.nextRoomId++, players: [player] };
      this.rooms.push(room);
      return room;
    }
  }

  removePlayerRooms(playerIndex: number) {
    // Filter out rooms created by the disconnected player
    const roomsToRemove = this.rooms.filter((room) =>
      room.players.some((player) => player.index === playerIndex)
    );

    // Remove these rooms
    roomsToRemove.forEach((room) => {
      const roomIndex = this.rooms.indexOf(room);
      if (roomIndex > -1) {
        this.rooms.splice(roomIndex, 1);
        console.log(`Removed room created by player index: ${playerIndex}`);
      }
    });
  }

  getRooms(): Room[] {
    return this.rooms.filter((room) => {
      // Check that the room is not full (less than 2 players)
      const isRoomNotFull = room.players.length < 2;

      // Check that none of the players in the room are engaged in another room's game
      const arePlayersNotInOtherGames = !room.players.some((player) =>
        this.games.some((game) =>
          game.players.some((gamePlayer) => gamePlayer.index === player.index)
        )
      );

      return isRoomNotFull && arePlayersNotInOtherGames;
    });
  }

  addUserToRoom(player: Player, roomId: number | string): Room | undefined {
    const room = this.rooms.find((room) => room.roomId === roomId);
    if (!room) {
      console.error(`Room not found: ${roomId}`);
      return undefined;
    }

    // Check if the player is already in the room
    const isPlayerInRoom = room.players.some((p) => p.index === player.index);
    if (isPlayerInRoom) {
      console.log(`Player ${player.name} is already in the room: ${roomId}`);
      return room; // Return the room without adding the player again
    }

    if (room.players.length >= 2) {
      console.error(`Room is full: ${roomId}`);
      return undefined;
    }

    room.players.push(player);
    return room;
  }

  //Game logic
  createGameSession(room: Room): Game {
    const game: Game = {
      gameId: this.nextGameId++, // Increment and assign a unique game ID
      players: room.players,
      boards: new Map<number | string, Board>(),
      currentTurnPlayerIndex: '',
    };
    this.games.push(game); // Add the new game to the games list
    return game;
  }

  notifyPlayersGameStart(room: Room, game: Game) {
    const message = JSON.stringify({
      type: 'create_game',
      data: {
        idGame: game.gameId,
        // idPlayer should be specific to the recipient, so you'll loop through each player to customize this part
      },
      id: 0,
    });

    room.players.forEach((player) => {
      const wsClient = this.connections.get(player.index); // Assuming you have a way to get WebSocketClient by player index
      if (wsClient) {
        // Customize message for each player
        const personalizedMessage = JSON.stringify({
          ...JSON.parse(message),
          data: {
            ...JSON.parse(message).data,
            idPlayer: player.index, // Assign the player's unique session ID here
          },
        });

        wsClient.send(personalizedMessage);
      }
    });
  }

  updateGame(updatedGame: Game): void {
    const gameIndex = this.games.findIndex(
      (game) => game.gameId === updatedGame.gameId
    );
    if (gameIndex > -1) {
      this.games[gameIndex] = updatedGame; // Update the game state
      console.log(`Game ${updatedGame.gameId} updated`);
    } else {
      console.log(`Game ${updatedGame.gameId} not found for update`);
    }
  }

  getConnectionByPlayerIndex(index: number): WebSocketClient | undefined {
    return this.connections.get(index);
  }

  getGameById(gameId: number): Game | undefined {
    return this.games.find((game) => game.gameId === gameId);
  }

  // Inside the Database class

  // Method to handle player disconnection
  handlePlayerDisconnect(playerIndex: number): void {
    // Find the game that includes the disconnected player
    const game = this.games.find((g) =>
      g.players.some((p) => p.index === playerIndex)
    );

    if (!game) {
      console.error('Game not found for disconnected player.');
      return;
    }

    // Identify the opponent and declare them as the winner
    const winner = game.players.find((p) => p.index !== playerIndex);
    if (!winner) {
      console.error('Opponent not found.');
      return;
    }

    // Update the winner's wins count
    const winnerData = this.winners.find((w) => w.name === winner.name);
    if (winnerData) {
      winnerData.wins += 1;
    } else {
      this.winners.push({ name: winner.name, wins: 1 });
    }

    // Remove the game from the active games list
    const gameIndex = this.games.indexOf(game);
    if (gameIndex > -1) {
      this.games.splice(gameIndex, 1);
    }

    // Send the finish command to the winner
    const wsClient = this.connections.get(winner.index);
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(
        JSON.stringify({
          type: 'finish',
          data: JSON.stringify({ winPlayer: winner.index }),
          id: 0,
        })
      );
    }
  }
}

export const database = new Database();
