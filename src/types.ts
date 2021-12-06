export interface APIMessage {
  Type: 'nap::APIMessage',
  mID: string,
  Name: string,
  Arguments: Array<APIArgument>,
};

export interface APIArgument {
  Type: 'nap::APIString' |
        'nap::APIInt' |
        'nap::APILong' |
        'nap::APIFloat' |
        'nap::APIDouble' |
        'nap::APIChar' |
        'nap::APIByte' |
        'nap::APIBool'
  mID: string,
  Name: string,
  Value: string | number | bigint | boolean,
};
