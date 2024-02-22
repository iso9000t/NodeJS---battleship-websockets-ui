import { httpServer } from './src/http_server/httpServer';
import './src/websocket/websocketServer';
import 'dotenv/config';

const httpPort = process.env.HTTP_PORT;
const wsPort = process.env.WS_PORT;

console.log(`Start static http server on the ${httpPort} port!`);
httpServer.listen(httpPort);

