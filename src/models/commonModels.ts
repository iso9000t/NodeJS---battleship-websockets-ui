import { WebSocket } from 'ws';

export interface WebSocketClient extends WebSocket {
  index: number;
  name: string;
}

export interface Command {
  type: string;
  data: string;
  id: number;
}

export enum CommandType {
  registration = 'reg',
  createGame = 'create_game',
  startGame = 'start_game',
  createRoom = 'create_room',
  updateRoom = 'update_room',
  addUserToRoom = 'add_user_to_room',
  updateWinners = 'update_winners',
  turn = 'turn',
  attack = 'attack',
  randomAttack = 'randomAttack',
  finish = 'finish',
  addShips = 'add_ships',
}

export enum AttackStatus {
  killed = 'killed',
  miss = 'miss',
  shot = 'shot',
}

export enum SquareStatus {
  safe = 'safe',
  shot = 'shot',
  empty = 'empty',
}
