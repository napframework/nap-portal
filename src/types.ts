export interface APIMessage {
  Type: 'nap::APIMessage',
  mID: string,
  Name: string,
  Arguments: Array<APIArgument>,
};

export interface APIArgument {
  Type: APIArgumentType,
  mID: string,
  Name: string,
  Value: string | number | bigint | boolean,
};

export enum APIArgumentType {
  String = 'nap::APIString',
  Bool = 'nap::APIBool',
  Char = 'nap::APIChar',
  Byte = 'nap::APIByte',
  Int = 'nap::APIInt',
  Long = 'nap::APILong',
  Float = 'nap::APIFloat',
  Double = 'nap::APIDouble',
};
