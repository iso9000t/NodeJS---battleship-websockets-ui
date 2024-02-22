import { WebSocket } from 'ws';
import { handleRegistration } from '../handlers/registrationHandler';

export const handleCommand = (wsClient: WebSocket, message: string) => {
  const command = JSON.parse(message);

  switch (command.type) {
    case 'reg':
      handleRegistration(wsClient, command);
      break;
    // Implement other cases for different command types
    default:
      console.error('Unhandled command:', command.type);
      // Optionally, inform the client that the command was not recognized
      wsClient.send(JSON.stringify({ error: 'Unknown command' }));
  }
};
