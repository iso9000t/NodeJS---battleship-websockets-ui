import { WebSocketServer } from 'ws';
import { handleRegistration } from '../handlers/registrationHandler';
import { handleCreateRoom } from '../handlers/createRoomHandler';

import { handleAddUserToRoom } from '../handlers/addUserToRoomHandler';
import { handleAddShips } from '../handlers/addShipsHandler';
import { WebSocketClient, Command } from '../models/commonModels';

export const handleCommand = (
  wsClient: WebSocketClient,
  message: string,
  wss: WebSocketServer
) => {
  const command: Command = JSON.parse(message);

  switch (command.type) {
    case 'reg':
      handleRegistration(wsClient, command, wss);
      break;

    case 'create_room':
      handleCreateRoom(wsClient, command, wss);
      break;

    case 'add_user_to_room':
      handleAddUserToRoom(wsClient, command, wss);
      break;

    case 'add_ships':
      handleAddShips(wsClient, command, wss);
      break;

    default:
      console.error('Unhandled command:', command.type);
      wsClient.send(JSON.stringify({ error: 'Unknown command' }));
  }
};
