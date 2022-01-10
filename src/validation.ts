// Local Includes
import {
  PortalDefs,
  APIMessage,
  APIArgument,
  APIArgumentString,
  APIArgumentBoolean,
  APIArgumentNumeric,
  APIArgumentType,
  APIArgumentTypes,
  PortalEvent,
  PortalEventHeader,
  PortalIdArgument,
  PortalEventTypeArgument,
  PortalEventTypes,
} from "./types";
import {
  getArgumentByName,
} from "./utils";

// External Includes
import {
  isArray,
  isBoolean,
  isNumber,
  isObject,
  isString,
} from 'lodash';


/**
 * Tests whether the supplied event is a valid portal event.
 * Throws an error with descriptive message when the validation fails.
 * @param event the event to verify
 * @returns the valid portal event
 */
export function testPortalEvent(event: Partial<PortalEvent>): PortalEvent {
  if (!isObject(event))
    throw new Error(`Portal event is not an object: ${event}`);

  if (!isArray(event.Objects))
    throw new Error(`Portal event Objects property is not an array: ${event.Objects}`);

  if (!event.Objects.length)
    throw new Error(`Portal event Objects property is an empty array`);

  // Ensure the first message is a portal event header
  testPortalEventHeader(event.Objects[0]);

  // Ensure the other messages are valid API messages
  for (let i = 1; i < event.Objects.length; i++)
    testAPIMessage(event.Objects[i]);

  return event as PortalEvent;
}


/**
 * Tests whether the supplied header is in a valid portal event header format.
 * Throws an error with descriptive message when the validation fails.
 * @param header the header to verify
 * @returns the valid portal event header
 */
function testPortalEventHeader(header: Partial<PortalEventHeader>): PortalEventHeader {
  const validMessage = testAPIMessage(header);

  if (validMessage.Name !== PortalDefs.eventHeaderName)
    throw new Error(`Portal event header Name property should be "${PortalDefs.eventHeaderName}", got "${validMessage.Name}"`);

  testPortalIdArgument(getArgumentByName(validMessage, PortalDefs.portalIDArgName));
  testPortalEventTypeArgument(getArgumentByName(validMessage, PortalDefs.eventTypeArgName));

  return validMessage as PortalEventHeader;
};


/**
 * Tests whether the supplied message is in a valid API message format.
 * Throws an error with descriptive message when the validation fails.
 * @param message the message to verify
 * @returns the valid API message
 */
function testAPIMessage(message: Partial<APIMessage>): APIMessage {
  if (!isObject(message))
    throw new Error(`API message is not an object: ${message}`);

  if (message.Type !== PortalDefs.apiMessageType)
    throw new Error(`API message Type property should be "${PortalDefs.apiMessageType}", got "${message.Type}"`);

  if (!isString(message.mID))
    throw new Error(`API message mID property is not a string: ${message.mID}`);

  if (!isString(message.Name))
    throw new Error(`API message Name property is not a string: ${message.Name}`);

  if (!isArray(message.Arguments))
    throw new Error(`API message Arguments property is not an array: ${message.Arguments}`);

  for (const argument of message.Arguments)
    testAPIArgument(argument);

  return message as APIMessage;
};


/**
 * Tests whether the supplied argument is in a valid API argument format.
 * Throws an error with descriptive message when the validation fails.
 * @param argument the argument to verify
 * @returns the valid API argument
 */
function testAPIArgument(argument: Partial<APIArgument>): APIArgument {
  if (!isObject(argument))
    throw new Error(`API argument is not an object: ${argument}`);

  if (!isString(argument.Type) || !APIArgumentTypes.includes(argument.Type))
    throw new Error(`API argument Type property is invalid: "${argument.Type}"`);

  if (!isString(argument.mID))
    throw new Error(`API argument mID property is not a string: ${argument.mID}`);

  if (!isString(argument.Name))
    throw new Error(`API argument Name property is not a string: ${argument.Name}`);

  if (!('Value' in argument))
    throw new Error(`API argument Value property is missing`);

  return argument as APIArgument;
};


/**
 * Tests whether the supplied argument contains a string value.
 * Throws an error with descriptive message when the validation fails.
 * @param argument the argument to verify
 * @returns the string argument
 */
export function testAPIArgumentString(argument: APIArgument): APIArgumentString {
  if (!isString(argument.Value))
    throw new Error(`API argument with Name "${argument.Name}" should have string Value, got "${typeof argument.Value}"`);

  if (argument.Type !== APIArgumentType.String)
    throw new Error(`API argument with Name "${argument.Name}" should have string Type, got "${argument.Type}"`);

  return argument as APIArgumentString;
}


/**
 * Tests whether the supplied argument contains a boolean value.
 * Throws an error with descriptive message when the validation fails.
 * @param argument the argument to verify
 * @returns the boolean argument
 */
export function testAPIArgumentBool(argument: APIArgument): APIArgumentBoolean {
  if (!isBoolean(argument.Value))
    throw new Error(`API argument with Name "${argument.Name}" should have boolean Value, got "${typeof argument.Value}"`);

  if (argument.Type !== APIArgumentType.Boolean)
    throw new Error(`API argument with Name "${argument.Name}" should have boolean Type, got "${argument.Type}"`);

  return argument as APIArgumentBoolean;
}


/**
 * Tests whether the supplied argument contains a numerical value.
 * Throws an error with descriptive message when the validation fails.
 * @param argument the argument to verify
 * @returns the numerical argument
 */
export function testAPIArgumentNumeric(argument: APIArgument): APIArgumentNumeric {
  if (!isNumber(argument.Value))
    throw new Error(`API argument with Name "${argument.Name}" should have numerical Value, got "${typeof argument.Value}"`);

  if (!(argument.Type === APIArgumentType.Byte ||
        argument.Type === APIArgumentType.Int ||
        argument.Type === APIArgumentType.Long ||
        argument.Type === APIArgumentType.Float ||
        argument.Type === APIArgumentType.Double))
    throw new Error(`API argument with Name "${argument.Name}" should have numerical Type, got "${argument.Type}"`);

  return argument as APIArgumentNumeric;
}


/**
 * Tests whether the supplied argument is in a valid portal ID argument format.
 * Throws an error with descriptive message when the validation fails.
 * @param argument the argument to verify
 * @returns the valid portal ID argument
 */
function testPortalIdArgument(argument: APIArgument): PortalIdArgument {
  if (argument.Type !== APIArgumentType.String)
    throw new Error(`Portal ID argument Type property should be "${APIArgumentType.String}", got "${argument.Type}"`);

  if (argument.Name !== PortalDefs.portalIDArgName)
    throw new Error(`Portal ID argument Name property should be "${PortalDefs.portalIDArgName}", got "${argument.Name}"`);

  if (!isString(argument.Value))
    throw new Error(`Portal ID argument Value property is not a string: ${argument.Value}`);

  return argument as PortalIdArgument;
}


/**
 * Tests whether the supplied argument is in a valid event type argument format.
 * Throws an error with descriptive message when the validation fails.
 * @param argument the argument to verify
 * @returns the valid event type argument
 */
function testPortalEventTypeArgument(argument: APIArgument): PortalEventTypeArgument {
  if (argument.Type !== APIArgumentType.String)
    throw new Error(`Event type argument Type property should be "${APIArgumentType.String}", got "${argument.Type}"`);

  if (argument.Name !== PortalDefs.eventTypeArgName)
    throw new Error(`Event type argument Name property should be "${PortalDefs.eventTypeArgName}", got "${argument.Name}"`);

  if (!isString(argument.Value) || !PortalEventTypes.includes(argument.Value))
    throw new Error(`Event type argument Value property is invalid: "${argument.Value}"`);

  return argument as PortalEventTypeArgument;
}
