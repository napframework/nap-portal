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

export interface PortalEventHeaderInfo {
  eventId: string,
  portalId: string,
  eventType: PortalEventType,
};

export interface PortalEventHeader extends APIMessage {
  Name: 'portal_event_header',
  Arguments: [
    PortalEventIdArg,
    PortalEventTypeArg,
  ],
};

export interface PortalEventIdArg extends APIArgument {
  Type: APIArgumentType.String,
  Name: 'portal_id',
  Value: string,
};

export interface PortalEventTypeArg extends APIArgument {
  Type: APIArgumentType.String,
  Name: 'portal_event_type',
  Value: PortalEventType,
};

export enum PortalEventType {
  Request = 'EPortalEventType::Request',
  Response = 'EPortalEventType::Response',
  Update = 'EPortalEventType::Update',
  Invalid = 'EPortalEventType::Invalid',
};
