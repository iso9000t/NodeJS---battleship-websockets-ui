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
    return; // Stop further execution if player exists
  }

  // Add new player to the database and log the new player object
  const newPlayer = database.addPlayer(requestData.name, requestData.password);
  console.log('New player added:', newPlayer); // This is where you add the logging

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
