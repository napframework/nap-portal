// Local Includes
import {
  PortalDefs,
  APIArgumentType,
  PortalEventHeader,
  PortalEventHeaderInfo,
  PortalItemUpdate,
  PortalItemUpdateInfo,
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
    throw new Error(`NAPWebClient failed to get connection ticket: ${error}`);
  }
  const ticket: string = await response.text();
  return ticket;
};

/**
 * Creates a PortalEventHeader for a new portal event
 * @param info The info object used to create the event header
 * @returns A PortalEventHeader object for the new portal event
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
