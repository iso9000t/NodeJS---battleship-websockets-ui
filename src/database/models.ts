import { AttackStatus } from '../models/commonModels';

export class Player {
  name: string;
  password: string;
  index: number;
  wins: number;
}

export interface Room {
  roomId: number;
  players: Player[];
}

export interface Game {
  gameId: number;
  players: Player[];
  boards: Map<number | string, Board>;
  currentTurnPlayerIndex: number;
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

export interface Board {
  ships: Ship[];
  attacks: { x: number; y: number; status: AttackStatus }[];
}

export interface Winner {
  name: string;
  wins: number;
}
