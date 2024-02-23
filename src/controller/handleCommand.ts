// Ensure WebSocketClient is imported correctly at the top
import { WebSocketServer } from 'ws';
import { handleRegistration } from '../handlers/registrationHandler';
import { handleCreateRoom } from '../handlers/createRoomHandler';
import { Command, WebSocketClient } from '../models/models'; // Adjust import path as needed

export const handleCommand = (
  wsClient: WebSocketClient, // Adjusted parameter type
  message: string,
  wss: WebSocketServer
) => {
  const command: Command = JSON.parse(message);

  switch (command.type) {
    case 'reg':
      handleRegistration(wsClient, command); // Now correctly expecting a WebSocketClient
      break;
    case 'create_room':
      handleCreateRoom(wsClient, command, wss); // Consistently using WebSocketClient
      break;
    // Implement other cases for different command types
    default:
      console.error('Unhandled command:', command.type);
      wsClient.send(JSON.stringify({ error: 'Unknown command' }));
  }
};
