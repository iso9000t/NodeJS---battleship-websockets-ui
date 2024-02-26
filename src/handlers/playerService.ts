import { WebSocketClient } from '../models/commonModels';
import { database } from '../database/database';
import { Command, CommandType } from '../models/commonModels';

export class Player {
  static lastIndex = 0;
  index: number;
  name: string;
  password: string;
  wins: number;

  constructor(name: string, password: string) {
    this.index = ++Player.lastIndex;
    this.name = name;
    this.password = password;
    this.wins = 0;
  }
}

export const handlePlayerRegistration = (
  wsClient: WebSocketClient,
  command: Command
) => {
  const { name, password } = JSON.parse(command.data);
  let player = database.findPlayerByName(name);

  if (player) {
    if (player.password === password) {
      wsClient.send(
        JSON.stringify({
          type: CommandType.registration,
          data: JSON.stringify({ error: false, message: 'Welcome back!' }),
          id: command.id,
        })
      );
    } else {
      wsClient.send(
        JSON.stringify({
          type: CommandType.registration,
          data: JSON.stringify({ error: true, message: 'Incorrect password' }),
          id: command.id,
        })
      );
    }
  } else {
    database.addPlayer(name, password);

    player = database.findPlayerByName(name);

    wsClient.index = player.index;
    wsClient.name = player.name;

    wsClient.send(
      JSON.stringify({
        type: CommandType.registration,
        data: JSON.stringify({
          error: false,
          message: 'Registration successful',
        }),
        id: command.id,
      })
    );
  }
};
