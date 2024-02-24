import { WebSocket } from 'ws';
import { Command, WebSocketClient } from '../models/models';
import { database } from '../database/database';
// Assuming updateWinners is exported from where it's defined
import { updateWinners } from './updatewinners';
import { updateRoom } from './updateRoomHandler';
export function handleRegistration(ws: WebSocket, command: Command, wss) {
  // If wss is passed as a parameter
  console.log('Received registration command:', command);

  const wsClient = ws as unknown as WebSocketClient;

  const requestData = JSON.parse(command.data);
  console.log('Registration requestData:', requestData);

  const existingPlayer = database.findPlayerByName(requestData.name);
  if (existingPlayer) {
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
