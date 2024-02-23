import { WebSocket } from 'ws';
import { Command } from '../models/models';
import { database } from '../database/database';
import { WebSocketClient } from '../models/models';

export function handleRegistration(ws: WebSocket, command: Command) {
  console.log('Received registration command:', command);

  const wsClient = ws as unknown as WebSocketClient; // Cast ws to WebSocketClient

  const requestData = JSON.parse(command.data);
  console.log('Registration requestData:', requestData);

  const existingPlayer = database.findPlayerByName(requestData.name);
  console.log('Existing player check:', existingPlayer);

  if (existingPlayer) {
    // If the player already exists, send an error response
    wsClient.send(
      JSON.stringify({
        type: 'reg',
        data: JSON.stringify({
          error: true,
          errorText: 'Player already exists.',
        }),
        id: command.id,
      })
    );
    return;
  }

  // Add new player to the database
  const newPlayer = database.addPlayer(requestData.name, requestData.password);

  // Now, directly assign index and name to wsClient
  wsClient.index = newPlayer.index;
  wsClient.name = newPlayer.name;

  // Optionally, if you manage connections in your database, update there as well
  database.linkConnectionToPlayer(wsClient, newPlayer.index);

  console.log('New player added and linked:', newPlayer);

  // Construct and send a success response
  wsClient.send(
    JSON.stringify({
      type: 'reg',
      data: JSON.stringify({
        name: newPlayer.name,
        index: newPlayer.index,
        error: false,
        errorText: '',
      }),
      id: command.id,
    })
  );
}
