/**
 * Portal definitions
 */

export class PortalDefs {
  static readonly apiMessageType = "nap::APIMessage";      ///< Type of an API message
  static readonly eventHeaderName = "portal_event_header"; ///< Name of the portal event header
  static readonly portalIDArgName = "portal_id";           ///< Name of the argument containing the portal ID in the portal event header
  static readonly eventTypeArgName = "portal_event_type";  ///< Name of the argument containing the portal event type in the portal event header
  static readonly itemValueArgName = "item_value";         ///< Name of the argument containing the portal item value in the portal item message
}

/**
 * API message
 */

 export interface APIMessage {
  Type: typeof PortalDefs.apiMessageType,
  mID: string,
  Name: string,
  Arguments: Array<APIArgument>,
};

export interface APIArgument {
  Type: APIArgumentType,
  mID: string,
  Name: string,
  Value: APIArgumentValue,
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

export const APIArgumentTypes: Array<string> = Object.values(APIArgumentType);

export type APIArgumentValue = string | number | boolean;


/**
 * Portal event
 */

export type PortalEvent = {
  Objects: [
    PortalEventHeader,
    ...Array<APIMessage>,
  ],
};

export interface PortalEventHeaderInfo {
  eventId: string,
  portalId: string,
  eventType: EventType,
};

export interface PortalEventHeader extends APIMessage {
  Name: typeof PortalDefs.eventHeaderName,
  Arguments: [
    PortalIdArg,
    EventTypeArg,
  ],
};

export interface PortalIdArg extends APIArgument {
  Type: APIArgumentType.String,
  Name: typeof PortalDefs.portalIDArgName,
  Value: string,
};

export interface EventTypeArg extends APIArgument {
  Type: APIArgumentType.String,
  Name: typeof PortalDefs.eventTypeArgName,
  Value: EventType,
};

export enum EventType {
  Request = 'EPortalEventType::Request',
  Response = 'EPortalEventType::Response',
  Update = 'EPortalEventType::Update',
  Invalid = 'EPortalEventType::Invalid',
};

export const EventTypes: Array<string> = Object.values(EventType);


/**
 * Portal item
 */

export enum PortalItemType {
  Slider = 'nap::PortalItemSlider',
};

export const PortalItemTypes: Array<string> = Object.values(PortalItemType);

export interface PortalItemUpdateInfo {
  id: string,
  name: string,
  type: APIArgumentType,
  value: APIArgumentValue,
};

export interface PortalItemUpdate extends APIMessage {
  Arguments: [PortalItemValueArgument],
}

export interface PortalItemValueArgument extends APIArgument {
  Name: typeof PortalDefs.itemValueArgName,
}
