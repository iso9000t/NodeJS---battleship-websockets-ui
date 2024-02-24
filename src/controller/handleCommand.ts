// Ensure WebSocketClient is imported correctly at the top
import { WebSocketServer } from 'ws';
import { handleRegistration } from '../handlers/registrationHandler';
import { handleCreateRoom } from '../handlers/createRoomHandler';
import { Command, WebSocketClient } from '../models/models'; // Adjust import path as needed
import { handleAddUserToRoom } from '../handlers/addUserToRoomHandler';

export const handleCommand = (
  wsClient: WebSocketClient, // Adjusted parameter type
  message: string,
  wss: WebSocketServer
) => {
  const command: Command = JSON.parse(message);

  switch (command.type) {
    // In handleCommand.ts or wherever you handle incoming WebSocket messages
    case 'reg':
      handleRegistration(wsClient, command, wss); // Adjusted to pass wss
      break;

    case 'create_room':
      handleCreateRoom(wsClient, command, wss); // Consistently using WebSocketClient
      break;

    // Add a new case for handling addUserToRoom command
    case 'add_user_to_room':
      handleAddUserToRoom(wsClient, command, wss);
      break;

    // Implement other cases for different command types
    default:
      console.error('Unhandled command:', command.type);
      wsClient.send(JSON.stringify({ error: 'Unknown command' }));
  }
};
