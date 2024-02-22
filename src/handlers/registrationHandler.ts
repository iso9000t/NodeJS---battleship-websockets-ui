import { database } from '../database/database';

export function handleRegistration(ws, message) {
  const requestData = JSON.parse(message.data);

  const existingPlayer = database.findPlayerByName(requestData.name);
  if (existingPlayer) {
    const response = {
      type: 'reg',
      data: JSON.stringify({
        error: true,
        errorText: 'Player already exists.',
      }),
      id: message.id,
    };
    ws.send(JSON.stringify(response));
    return;
  }

  const newPlayer = database.addPlayer(requestData.name, requestData.password);

  const response = {
    type: 'reg',
    data: JSON.stringify({
      name: newPlayer.name,
      index: newPlayer.index,
      error: false,
      errorText: '',
    }),
    id: message.id,
  };

  ws.send(JSON.stringify(response));
}
