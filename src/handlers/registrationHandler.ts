import { WebSocket } from 'ws';
import { Command } from '../models/models';
import { database } from '../database/database';

export function handleRegistration(ws: WebSocket, command: Command) {
  console.log('Received registration command:', command);

  const requestData = JSON.parse(command.data);
  console.log('Registration requestData:', requestData);

  // Attempt to find an existing player by name
  const existingPlayer = database.findPlayerByName(requestData.name);
  console.log('Existing player check:', existingPlayer);

  // If the player already exists, send an error response
  if (existingPlayer) {
    const response = {
      type: 'reg',
      data: JSON.stringify({
        error: true,
        errorText: 'Player already exists.',
      }),
      id: command.id,
    };
    ws.send(JSON.stringify(response));
    return;
  }

  // Add new player to the database
  const newPlayer = database.addPlayer(requestData.name, requestData.password);

  // Link this WebSocket connection to the new player's index
  database.linkConnectionToPlayer(ws, newPlayer.index);

  console.log('New player added and linked:', newPlayer);

  // Construct and send a success response
  const response = {
    type: 'reg',
    data: JSON.stringify({
      name: newPlayer.name,
      index: newPlayer.index, // Access 'index' from the newPlayer object
      error: false,
      errorText: '',
    }),
    id: command.id,
  };

  ws.send(JSON.stringify(response));
}
