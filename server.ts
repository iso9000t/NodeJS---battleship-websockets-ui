// server.ts
import { httpServer } from './src/http_server/httpServer';
import { wss } from './src/websocket/websocketServer';
import 'dotenv/config';

const httpPort = process.env.HTTP_PORT || 8181;
const wsPort = process.env.WS_PORT || 3000;

console.log(`Start static http server on the ${httpPort} port!`);
httpServer.listen(httpPort);

console.log(`WebSocket server started on ws://localhost:${wsPort}`);

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Shutting down servers...');

  // Close the HTTP server
  httpServer.close(() => {
    console.log('HTTP server closed.');
  });

  // Close the WebSocket server
  wss.close(() => {
    console.log('WebSocket server closed.');
  });

  // Ensure the process exits after servers are closed
  setTimeout(() => {
    console.log('Servers successfully shutdown.');
    process.exit(0);
  }, 2000);
});
