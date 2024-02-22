export interface Player {
  name: string;
  password: string; // Consider storing hashed passwords for security reasons in a real-world app
  index: number;
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
