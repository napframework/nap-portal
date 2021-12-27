// Local Includes
import {
  PortalDefs,
  APIMessage,
  APIArgument,
  APIArgumentType,
  APIArgumentTypes,
  PortalEventHeader,
  PortalIdArg,
  EventTypeArg,
  EventTypes,
} from "./types";

// External Includes
import {
  isArray,
  isObject,
  isString,
} from 'lodash';


/**
 * Tests whether the supplied header is in a valid portal event header format.
 * Throws an error with descriptive message when the validation fails.
 * @param header the header to verify
 * @returns the valid portal event header
 */
export function testPortalEventHeader(header: Partial<PortalEventHeader>): PortalEventHeader {
  const validMessage = testAPIMessage(header);

  if (validMessage.Name !== PortalDefs.eventHeaderName)
    throw new Error(`Portal event header Name property should be "${PortalDefs.eventHeaderName}", got "${validMessage.Name}"`);

  const portalIdArg: APIArgument | undefined = validMessage.Arguments.find(arg => arg.Name === PortalDefs.portalIDArgName);
  if (!portalIdArg)
    throw new Error(`Portal event header is missing the "${PortalDefs.portalIDArgName}" argument`);

  const eventTypeArg: APIArgument | undefined = validMessage.Arguments.find(arg => arg.Name === PortalDefs.eventTypeArgName);
  if (!eventTypeArg)
    throw new Error(`Portal event header is missing the "${PortalDefs.eventTypeArgName}" argument`);

  testPortalIdArg(portalIdArg);
  testEventTypeArg(eventTypeArg);

  return validMessage as PortalEventHeader;
};


/**
 * Tests whether the supplied messages are an array of valid API messages.
 * Throws an error with descriptive message when the validation fails.
 * @param messages the messages to verify
 * @returns the valid API messages
 */
export function testAPIMessages(messages: Array<Partial<APIMessage>>): Array<APIMessage> {
  if (!isArray(messages))
    throw new Error(`API messages are not an array: ${messages}`);

  for (const message of messages)
    testAPIMessage(message);

  return messages as Array<APIMessage>;
}


/**
 * Tests whether the supplied message is in a valid API message format.
 * Throws an error with descriptive message when the validation fails.
 * @param message the message to verify
 * @returns the valid API message
 */
export function testAPIMessage(message: Partial<APIMessage>): APIMessage {
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
 * Tests whether the supplied argument is in a valid portal ID argument format.
 * Throws an error with descriptive message when the validation fails.
 * @param argument the argument to verify
 * @returns the valid portal ID argument
 */
function testPortalIdArg(argument: APIArgument): PortalIdArg {
  if (argument.Type !== APIArgumentType.String)
    throw new Error(`Portal ID argument Type property should be "${APIArgumentType.String}", got "${argument.Type}"`);

  if (argument.Name !== PortalDefs.portalIDArgName)
    throw new Error(`Portal ID argument Name property should be "${PortalDefs.portalIDArgName}", got "${argument.Name}"`);

  if (!isString(argument.Value))
    throw new Error(`Portal ID argument Value property is not a string: ${argument.Value}`);

  return argument as PortalIdArg;
}


/**
 * Tests whether the supplied argument is in a valid event type argument format.
 * Throws an error with descriptive message when the validation fails.
 * @param argument the argument to verify
 * @returns the valid event type argument
 */
function testEventTypeArg(argument: APIArgument): EventTypeArg {
  if (argument.Type !== APIArgumentType.String)
    throw new Error(`Event type argument Type property should be "${APIArgumentType.String}", got "${argument.Type}"`);

  if (argument.Name !== PortalDefs.eventTypeArgName)
    throw new Error(`Event type argument Name property should be "${PortalDefs.eventTypeArgName}", got "${argument.Name}"`);

  if (!isString(argument.Value) || !EventTypes.includes(argument.Value))
    throw new Error(`Event type argument Value property is invalid: "${argument.Value}"`);

  return argument as EventTypeArg;
}
