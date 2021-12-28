// Local Includes
import { NAPPortalItem } from './napportalitem';
import { NAPPortalItemSlider } from './napportalitemslider';
import {
  PortalDefs,
  APIMessage,
  APIArgument,
  APIArgumentType,
  PortalEventHeader,
  PortalEventHeaderInfo,
  PortalItemType,
  PortalItemUpdate,
  PortalItemUpdateInfo,
  PortalEventType,
} from "./types";

// External Includes
import { v4 as uuidv4 } from 'uuid';


/**
 * Retrieve an authentication ticket for the WebSocket connection
 * @param user The username for generating the authentication ticket
 * @param pass The password for generating the authentication ticket
 * @param url The HTTP endpoint of the NAP application
 * @returns A promise that resolves with the ticket after it has been retrieved
 */
export async function getTicket(user: string, pass: string, url: string): Promise<string> {
  const requestInit: RequestInit = {
    method: 'post',
    body: JSON.stringify({ user, pass }),
    headers: { 'Content-Type': 'application/json' },
  };
  const response: Response = await fetch(url, requestInit);
  if (!response.ok) {
    const error = `${response.url} ${response.status} (${response.statusText})`;
    throw new Error(`Failed to get NAPWebSocket connection ticket: ${error}`);
  }
  const ticket: string = await response.text();
  return ticket;
};


/**
 * Creates a portal event header for a new portal event from an info object
 * @param info The info object used to create the portal event header
 * @returns The portal event header for a new portal event
 */
export function getPortalEventHeader(info: PortalEventHeaderInfo): PortalEventHeader {
  return {
    Type: PortalDefs.apiMessageType,
    mID: info.eventId,
    Name: PortalDefs.eventHeaderName,
    Arguments: [
      {
        Type: APIArgumentType.String,
        mID: uuidv4(),
        Name: PortalDefs.portalIDArgName,
        Value: info.portalId,
      },
      {
        Type: APIArgumentType.String,
        mID: uuidv4(),
        Name: PortalDefs.eventTypeArgName,
        Value: info.eventType,
      },
    ],
  };
};


/**
 * Extracts the portal event header info from a valid portal event header
 * @param header The valid portal event header to extract the info from
 * @returns The info object extracted from the portal event header
 */
export function getPortalEventHeaderInfo(header: PortalEventHeader): PortalEventHeaderInfo {
  return {
    eventId: header.mID,
    portalId: getArgumentByName(header, PortalDefs.portalIDArgName).Value as string,
    eventType: getArgumentByName(header, PortalDefs.eventTypeArgName).Value as PortalEventType,
  };
};


/**
 * Creates an API message representing a portal item update
 * @param info The info object used to create the API message
 * @returns An API message representing a portal item update
 */
export function getPortalItemUpdate(info: PortalItemUpdateInfo): PortalItemUpdate {
  return {
    Type: PortalDefs.apiMessageType,
    mID: info.id,
    Name: info.name,
    Arguments: [{
      Type: info.type,
      mID: uuidv4(),
      Name: PortalDefs.itemValueArgName,
      Value: info.value,
    }],
  };
};


/**
 * Create a new portal item from an API message describing the item
 * @param message the API message describing the portal item
 * @returns the new portal item
 */
export function createPortalItem(message: APIMessage): NAPPortalItem {
  const itemTypeArg = getArgumentByName(message, PortalDefs.itemTypeArgName);
  switch (itemTypeArg.Value) {
    case PortalItemType.SliderByte:
    case PortalItemType.SliderInt:
    case PortalItemType.SliderLong:
    case PortalItemType.SliderFloat:
    case PortalItemType.SliderDouble:
      return new NAPPortalItemSlider(message);
    default:
      throw new Error(`Cannot create portal item type "${itemTypeArg.Value}"`);
  }
}


/**
 * Get an API argument from an API message by name.
 * Throws an error with descriptive message when not found.
 * @param message the API message to search for the API argument
 * @param name the name of the API argument to find
 * @returns the API argument
 */
export function getArgumentByName(message: APIMessage, name: string): APIArgument {
  const argument: APIArgument | undefined = message.Arguments.find(arg => arg.Name === name);
  if (!argument)
    throw new Error(`API message is missing the argument with name "${name}"`);
  return argument;
}


/**
 * Checks whether the supplied argument type is for an integral value
 * @param type the argument type to check
 * @returns whether the supplied argument type is for an integral value
 */
export function isIntegralArgumentType(type: APIArgumentType): boolean {
  return (
    type === APIArgumentType.Byte ||
    type === APIArgumentType.Int ||
    type === APIArgumentType.Long
  );
}
