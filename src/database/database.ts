import { WebSocket } from 'ws';
import { Player, Room, Game } from './models';

class Database {
  private players: Player[] = [];
  private rooms: Room[] = [];
  private games: Game[] = [];
  private nextRoomId: number = 0;
  private nextGameId: number = 0;
  private connectionToPlayerIndex = new Map<WebSocket, number>();

  // Player management
  addPlayer(name: string, password: string): Player {
    const player: Player = {
      name,
      password,
      index: this.players.length + 1, // Assuming index is a unique identifier
    };
    this.players.push(player);
    return player;
  }

  findPlayerByName(name: string): Player | undefined {
    return this.players.find((player) => player.name === name);
  }

  findPlayerByIndex(index: number): Player | undefined {
    return this.players.find((player) => player.index === index);
  }

  linkConnectionToPlayer(ws: WebSocket, index: number) {
    this.connectionToPlayerIndex.set(ws, index);
  }

  findPlayerByConnection(ws: WebSocket): Player | undefined {
    const index = this.connectionToPlayerIndex.get(ws);
    if (index !== undefined) {
      return this.findPlayerByIndex(index);
    }
    return undefined;
  }

  // Room management
  createRoom(player: Player): Room {
    const room: Room = {
      roomId: this.nextRoomId++,
      players: [player], // Starts with the room creator
    };
    this.rooms.push(room);
    return room;
  }

  findRoomById(roomId: number): Room | undefined {
    return this.rooms.find((room) => room.roomId === roomId);
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  // Game management
  createGame(players: Player[]): Game {
    const game: Game = {
      gameId: this.nextGameId++,
      players, // Assuming this is an array of player objects
    };
    this.games.push(game);
    return game;
  }

  findGameById(gameId: number): Game | undefined {
    return this.games.find((game) => game.gameId === gameId);
  }

  // Optionally, implement methods to manage games and rooms further as needed
}

// Export a single instance of the Database class to be used across your application
export const database = new Database();
