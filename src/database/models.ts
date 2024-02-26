import { AttackStatus } from "../models/commonModels";




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
  boards: Map<number | string, Board>; // Using player index or ID as key
  currentTurnPlayerIndex: number | string; // To track the current player's turn
  // You can add other properties as needed for game state, such as game status, winner, etc.
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean; // true for horizontal, false for vertical
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

export interface Board {
  ships: Ship[];
  attacks: { x: number; y: number; status: AttackStatus }[]; // Tracks all attack attempts, with their results
}

export interface Winner {
  name: string;
  wins: number;
}