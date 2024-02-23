import { WebSocket, WebSocketServer } from 'ws';
import { handleRegistration } from '../handlers/registrationHandler';
import { handleCreateRoom } from '../handlers/createRoomHandler';

// Adjust handleCommand to include wss parameter
export const handleCommand = (
  wsClient: WebSocket,
  message: string,
  wss: WebSocketServer
) => {
  const command = JSON.parse(message);

  switch (command.type) {
    case 'reg':
      handleRegistration(wsClient, command); // Registration might not need wss
      break;
    case 'create_room':
      handleCreateRoom(wsClient, command, wss); // Now passing wss
      break;
    // Implement other cases for different command types
    default:
      console.error('Unhandled command:', command.type);
      wsClient.send(JSON.stringify({ error: 'Unknown command' }));
  }
};
