export class Player {
  name: string;
  password: string; // Consider using hashed passwords for actual applications
  index: number; // Unique identifier for the player
  wins: number;
}

export interface Room {
  roomId: number;
  players: Player[];
}

export interface Game {
  gameId: number;
  players: Player[];
  // Additional properties for game state can be added here
}
