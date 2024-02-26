import { WebSocket } from 'ws';
import { Command, WebSocketClient } from '../models/commonModels';
import { database } from '../database/database';
// Assuming updateWinners is exported from where it's defined
import { updateWinners } from './updateWinners';
import { updateRoom } from './updateRoomHandler';

export function handleRegistration(ws: WebSocket, command: Command, wss) {
  console.log('Received registration command:', command);

  const wsClient = ws as unknown as WebSocketClient;
  const requestData = JSON.parse(command.data);
  console.log('Registration requestData:', requestData);

  const existingPlayer = database.findPlayerByName(requestData.name);

  if (existingPlayer) {
    // Player exists, check password
    if (existingPlayer.password === requestData.password) {
      // Password matches, player is logging back in
      wsClient.index = existingPlayer.index;
      wsClient.name = existingPlayer.name;
      database.linkConnectionToPlayer(wsClient, existingPlayer.index);

      wsClient.send(
        JSON.stringify({
          type: 'reg',
          data: JSON.stringify({
            error: false,
            message: 'Welcome back!',
            name: existingPlayer.name,
            index: existingPlayer.index,
          }),
          id: command.id,
        })
      );
    } else {
      // Password does not match
      wsClient.send(
        JSON.stringify({
          type: 'reg',
          data: JSON.stringify({
            error: true,
            errorText: 'Incorrect password.',
          }),
          id: command.id,
        })
      );
    }
    return; // Stop further processing
  }

  // If the player doesn't exist, add them as new
  const newPlayer = database.addPlayer(requestData.name, requestData.password);
  wsClient.index = newPlayer.index;
  wsClient.name = newPlayer.name;
  database.linkConnectionToPlayer(wsClient, newPlayer.index);

  console.log('New player added and linked:', newPlayer);

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

  updateRoom(wss);
  updateWinners(wss);
}
