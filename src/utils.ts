// Local Includes
import { NAPPortalItem } from './napportalitem';
import { NAPPortalItemButton } from './napportalitembutton';
import { NAPPortalItemColor } from './napportalitemcolor';
import { NAPPortalItemOperationalCalendar } from './napportalitemoperationalcalendar';
import { NAPPortalItemSlider } from './napportalitemslider';
import { NAPPortalItemTextArea } from './napportalitemtextarea';
import { NAPPortalItemTextField } from './napportalitemtextfield';
import { NAPPortalItemToggle } from './napportalitemtoggle';
import {
  testAPIArgumentString,
  testAPIArgumentStringArray,
  testAPIArgumentBoolean,
  testAPIArgumentBooleanArray,
  testAPIArgumentNumeric,
  testAPIArgumentNumericArray,
} from './validation';
import {
  PortalDefs,
  APIMessage,
  APIArgument,
  APIArgumentString,
  APIArgumentStringArray,
  APIArgumentBoolean,
  APIArgumentBooleanArray,
  APIArgumentNumeric,
  APIArgumentNumericArray,
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
 * Extracts the portal item update info from a valid portal item update
 * @param update The valid portal item update to extract the info from
 * @returns The info object extracted from the portal item update
 */
export function getPortalItemUpdateInfo(update: PortalItemUpdate): PortalItemUpdateInfo {
  const valueArg = getArgumentByName(update, PortalDefs.itemValueArgName);
  return {
    id: update.mID,
    name: update.Name,
    type: valueArg.Type,
    value: valueArg.Value,
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
    case PortalItemType.Button:
      return new NAPPortalItemButton(message);
    case PortalItemType.ColorRGB8:
      return new NAPPortalItemColor(message, false);
    case PortalItemType.ColorRGBA8:
      return new NAPPortalItemColor(message, true);
    case PortalItemType.ColorRGBFloat:
      return new NAPPortalItemColor(message, false);
    case PortalItemType.ColorRGBAFloat:
      return new NAPPortalItemColor(message, true);
    case PortalItemType.OperationalCalendar:
      return new NAPPortalItemOperationalCalendar(message);
    case PortalItemType.SliderByte:
    case PortalItemType.SliderInt:
    case PortalItemType.SliderLong:
    case PortalItemType.SliderFloat:
    case PortalItemType.SliderDouble:
      return new NAPPortalItemSlider(message);
    case PortalItemType.TextArea:
      return new NAPPortalItemTextArea(message);
    case PortalItemType.TextField:
      return new NAPPortalItemTextField(message);
    case PortalItemType.Toggle:
      return new NAPPortalItemToggle(message);
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
 * Get the value of a string API argument from an API message by name.
 * Throws an error with descriptive message when no matching argument is found.
 * @param message the API message to search for the API argument
 * @param name the name of the API argument to find
 * @returns the string API argument value
 */
export function getStringArgumentValue(message: APIMessage, name: string): string {
  const argument: APIArgument = getArgumentByName(message, name);
  const string: APIArgumentString = testAPIArgumentString(argument);
  return string.Value;
}


/**
 * Get the value of a string array API argument from an API message by name.
 * Throws an error with descriptive message when no matching argument is found.
 * @param message the API message to search for the API argument
 * @param name the name of the API argument to find
 * @returns the string array API argument value
 */
export function getStringArrayArgumentValue(message: APIMessage, name: string): Array<string> {
  const argument: APIArgument = getArgumentByName(message, name);
  const stringArray: APIArgumentStringArray = testAPIArgumentStringArray(argument);
  return stringArray.Value;
}


/**
 * Get the value of a boolean API argument from an API message by name.
 * Throws an error with descriptive message when no matching argument is found.
 * @param message the API message to search for the API argument
 * @param name the name of the API argument to find
 * @returns the boolean API argument value
 */
export function getBooleanArgumentValue(message: APIMessage, name: string): boolean {
  const argument: APIArgument = getArgumentByName(message, name);
  const boolean: APIArgumentBoolean = testAPIArgumentBoolean(argument);
  return boolean.Value;
}


/**
 * Get the value of a boolean array API argument from an API message by name.
 * Throws an error with descriptive message when no matching argument is found.
 * @param message the API message to search for the API argument
 * @param name the name of the API argument to find
 * @returns the boolean array API argument value
 */
export function getBooleanArrayArgumentValue(message: APIMessage, name: string): Array<boolean> {
  const argument: APIArgument = getArgumentByName(message, name);
  const booleanArray: APIArgumentBooleanArray = testAPIArgumentBooleanArray(argument);
  return booleanArray.Value;
}


/**
 * Get the value of a numeric API argument from an API message by name.
 * Throws an error with descriptive message when no matching argument is found.
 * @param message the API message to search for the API argument
 * @param name the name of the API argument to find
 * @returns the numeric API argument value
 */
export function getNumericArgumentValue(message: APIMessage, name: string): number {
  const argument: APIArgument = getArgumentByName(message, name);
  const numeric: APIArgumentNumeric = testAPIArgumentNumeric(argument);
  return numeric.Value;
}


/**
 * Get the value of a numeric array API argument from an API message by name.
 * Throws an error with descriptive message when no matching argument is found.
 * @param message the API message to search for the API argument
 * @param name the name of the API argument to find
 * @returns the numeric array API argument value
 */
export function getNumericArrayArgumentValue(message: APIMessage, name: string): Array<number> {
  const argument: APIArgument = getArgumentByName(message, name);
  const numericArray: APIArgumentNumericArray = testAPIArgumentNumericArray(argument);
  return numericArray.Value;
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


/**
 * Converts an array of RGB values to a hexidecimal color string
 * @param values the array of RGB values to convert
 * @returns the hexadecimal color string
 */
export function rgbToHex(values: Array<number>): string {
  if (values.length < 3)
    throw new Error(`Missing color channels to convert to hex, need 3, got ${values.length}`);
  const r = values[0].toString(16).padStart(2, '0');
  const g = values[1].toString(16).padStart(2, '0');
  const b = values[2].toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}


/**
 * Converts a hexidecimal color string to an array of RGB values
 * @param value the hexadecimal color string to convert
 * @returns the array of RGB values
 */
export function hexToRgb(value: string): Array<number> {
  if (value.length < 7)
    throw new Error(`Invalid hex color provided to convert to RGB, got ${value}`);
  return [
    parseInt(value.substring(1, 3), 16),
    parseInt(value.substring(3, 5), 16),
    parseInt(value.substring(5), 16),
  ]
}
