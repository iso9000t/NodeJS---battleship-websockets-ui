import { httpServer } from './src/http_server/httpServer';
import { wss } from './src/websocket/websocketServer';
import 'dotenv/config';

const httpPort = process.env.HTTP_PORT || 8181;
const wsPort = process.env.WS_PORT || 3000;

console.log(`Start static http server on the ${httpPort} port!`);
httpServer.listen(httpPort);

console.log(`WebSocket server started on ws://localhost:${wsPort}`);

process.on('SIGINT', () => {
  console.log('Shutting down servers...');

  httpServer.close(() => {
    console.log('HTTP server closed.');
  });

  wss.close(() => {
    console.log('WebSocket server closed.');
  });

  setTimeout(() => {
    console.log('Servers successfully shutdown.');
    process.exit(0);
  }, 2000);
});
