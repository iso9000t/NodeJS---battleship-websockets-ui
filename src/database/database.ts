import { WebSocketClient } from '../models/models';
import { Player, Room, Game } from './models';

class Database {
  private players: Player[] = [];
  private rooms: Room[] = [];
  private games: Game[] = [];
  private nextRoomId: number = 0;
  private nextGameId: number = 0;
  connections: Map<number, WebSocketClient> = new Map();

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
      // Assuming a maximum of 2 players per room
      console.error(`Room is full: ${roomId}`);
      return undefined;
    }

    room.players.push(player);
    return room;
  }

  //Game logic
  createGameSession(room: Room): Game {
    // Logic to create a game session
    const game: Game = {
      gameId: this.nextGameId++, // Increment and assign a unique game ID
      players: room.players,
      // Initialize other game state properties as needed
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
}



export const database = new Database();
