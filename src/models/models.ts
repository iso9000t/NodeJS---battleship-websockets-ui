export enum CommandType {
  reg = 'reg',
  create_room = 'create_room',
  update_room = 'update_room',
  // Add other command types as needed
}

export interface Command {
  type: CommandType
  data: string;
  id: number;
}
