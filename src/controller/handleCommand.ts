import { WebSocketServer } from 'ws';
import { handleRegistration } from '../handlers/registrationHandler';
import { handleCreateRoom } from '../handlers/createRoomHandler';
import { Command, WebSocketClient } from '../models/commonModels'; // Adjust import path as needed
import { handleAddUserToRoom } from '../handlers/addUserToRoomHandler';
import { handleAddShips } from '../handlers/addShipsHandler';
import { handleAttack } from '../handlers/attackHandler';
/* import { handleRandomAttack } from '../handlers/randomAttackHandler'; */

export const handleCommand = (
  wsClient: WebSocketClient, // Adjusted parameter type
  message: string,
  wss: WebSocketServer
) => {
  const command: Command = JSON.parse(message);

  switch (command.type) {
    case 'reg':
      handleRegistration(wsClient, command, wss);
      break;

    case 'create_room':
      handleCreateRoom(wsClient, command, wss); // Consistently using WebSocketClient
      break;

    case 'add_user_to_room':
      handleAddUserToRoom(wsClient, command, wss);
      break;

    case 'add_ships':
      handleAddShips(wsClient, command, wss);
      break;

    case 'attack':
      handleAttack(wsClient, command, wss);
      break;
    
   /*  case 'randomAttack':
      handleRandomAttack(wsClient, command, wss);
      break; */
    
    default:
      console.error('Unhandled command:', command.type);
      wsClient.send(JSON.stringify({ error: 'Unknown command' }));
  }
};
