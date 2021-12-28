/**
 * Portal definitions
 */

export class PortalDefs {
  static readonly apiMessageType = "nap::APIMessage";       ///< Type of an API message
  static readonly eventHeaderName = "portal_event_header";  ///< Name of the portal event header
  static readonly portalIDArgName = "portal_id";            ///< Name of the argument containing the portal ID in the portal event header
  static readonly eventTypeArgName = "portal_event_type";   ///< Name of the argument containing the portal event type in the portal event header
  static readonly itemTypeArgName = "portal_item_type";     ///< Name of the argument containing the portal item type in the portal item message
  static readonly itemValueArgName = "portal_item_value";   ///< Name of the argument containing the portal item value in the portal item message
  static readonly itemMinArgName = "portal_item_min";       ///< Name of the argument containing the minimum portal item value in the portal item message
  static readonly itemMaxArgName = "portal_item_max";       ///< Name of the argument containing the maximum portal item value in the portal item message
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


/**
 * API argument
 */

export interface APIArgument {
  Type: APIArgumentType,
  mID: string,
  Name: string,
  Value: APIArgumentValue,
};

export enum APIArgumentType {
  String = 'nap::APIString',
  Bool = 'nap::APIBool',
  Byte = 'nap::APIByte',
  Int = 'nap::APIInt',
  Long = 'nap::APILong',
  Float = 'nap::APIFloat',
  Double = 'nap::APIDouble',
};

// Array containing all available API argument types, useful for validation
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
  eventType: PortalEventType,
};

export interface PortalEventHeader extends APIMessage {
  Name: typeof PortalDefs.eventHeaderName,
  Arguments: [
    PortalIdArgument,
    PortalEventTypeArgument,
  ],
};

export interface PortalIdArgument extends APIArgument {
  Type: APIArgumentType.String,
  Name: typeof PortalDefs.portalIDArgName,
  Value: string,
};

export interface PortalEventTypeArgument extends APIArgument {
  Type: APIArgumentType.String,
  Name: typeof PortalDefs.eventTypeArgName,
  Value: PortalEventType,
};

export enum PortalEventType {
  Request = 'Request',
  Response = 'Response',
  Update = 'Update',
  Invalid = 'Invalid',
};

// Array containing all available portal event types, useful for validation
export const PortalEventTypes: Array<string> = Object.values(PortalEventType);


/**
 * Portal item
 */

export enum PortalItemType {
  SliderByte = 'nap::PortalItemSliderByte',
  SliderInt = 'nap::PortalItemSliderInt',
  SliderLong = 'nap::PortalItemSliderLong',
  SliderFloat = 'nap::PortalItemSliderFloat',
  SliderDouble = 'nap::PortalItemSliderDouble',
};

// Array containing all available portal item types, useful for validation
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
