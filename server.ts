// Import the HTTP server
import { httpServer } from './src/http_server/httpServer';
// Import the WebSocket server module to start it
import './src/websocket/websocketServer';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

// WebSocket server is started by the import, so no need to explicitly start it here
