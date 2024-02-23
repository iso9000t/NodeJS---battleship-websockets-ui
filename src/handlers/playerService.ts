// Import necessary types and dependencies
import { WebSocketClient } from '../models/models';
import { database } from '../database/database';
import { Command, CommandType } from '../models/models';

// Player class definition
export class Player {
  static lastIndex = 0;
  index: number;
  name: string;
  password: string;
  wins: number;

  constructor(name: string, password: string) {
    this.index = ++Player.lastIndex; // Unique index for each player
    this.name = name;
    this.password = password;
    this.wins = 0; // Initialize wins
  }
}

// Function to handle player registration
export const handlePlayerRegistration = (
  wsClient: WebSocketClient,
  command: Command
) => {
  const { name, password } = JSON.parse(command.data);
  // Attempt to find an existing player by name
  let player = database.findPlayerByName(name);

  if (player) {
    // Player exists, check password
    if (player.password === password) {
      // Password matches, player is logging back in
      wsClient.send(
        JSON.stringify({
          type: CommandType.registration,
          data: JSON.stringify({ error: false, message: 'Welcome back!' }),
          id: command.id,
        })
      );
    } else {
      // Password does not match
      wsClient.send(
        JSON.stringify({
          type: CommandType.registration,
          data: JSON.stringify({ error: true, message: 'Incorrect password' }),
          id: command.id,
        })
      );
    }
  } else {
    // New player, add to database
    database.addPlayer(name, password);
    // Assuming addPlayer now returns the new player object or index
    player = database.findPlayerByName(name); // Retrieve the newly created player for the index

    // Set WebSocketClient properties
    wsClient.index = player.index;
    wsClient.name = player.name;

    // Send registration success message
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

    // Here you could also update rooms, notify other clients, etc.
  }
};

// Add any other player-related functionalities as needed
