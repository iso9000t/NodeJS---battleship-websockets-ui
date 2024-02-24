import { WebSocketClient } from '../models/models';
import { Player, Room, Game } from './models';

class Database {
  private players: Player[] = [];
  private rooms: Room[] = [];
  private games: Game[] = [];
  private nextRoomId: number = 0;
  private nextGameId: number = 0;
  private connections: Map<number, WebSocketClient> = new Map();

  // Player management
  addPlayer(name: string, password: string): Player {
    // Ensure the new index calculation accounts for unique identification
    const newIndex = this.players.length
      ? Math.max(...this.players.map((p) => p.index)) + 1
      : 1;
    const player: Player = {
      name,
      password,
      index: newIndex,
      wins: 0, // Initialize wins to 0 for new players
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
    return this.rooms;
  }
  // Game management and other methods remain the same...
}

export const database = new Database();
