import { Player, Room, Game } from './models'

class Database {
  private players: Player[] = [];
  private rooms: Room[] = [];
  private games: Game[] = [];
  private nextRoomId: number = 0;
  private nextGameId: number = 0;

  // Player management
  addPlayer(name: string, password: string): Player {
    const player: Player = { name, password, index: this.players.length + 1 };
    this.players.push(player);
    return player;
  }

  findPlayerByName(name: string): Player | undefined {
    return this.players.find((player) => player.name === name);
  }

  // Room management
  createRoom(player: Player): Room {
    const room: Room = { roomId: this.nextRoomId++, players: [player] };
    this.rooms.push(room);
    return room;
  }

  findRoomById(roomId: number): Room | undefined {
    return this.rooms.find((room) => room.roomId === roomId);
  }

  // Game management
  createGame(players: Player[]): Game {
    const game: Game = { gameId: this.nextGameId++, players };
    this.games.push(game);
    return game;
  }

  findGameById(gameId: number): Game | undefined {
    return this.games.find((game) => game.gameId === gameId);
  }

  // Implement more methods as needed for your game logic
}

// Export a single instance of the Database class to be used across your application
export const database = new Database();
