// Local Includes
import {
  PortalDefs,
  APIMessage,
  APIArgument,
  APIArgumentTypes,
} from "./types";

// External Includes
import {
  isArray,
  isObject,
  isString,
} from 'lodash';

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

  for (const argument in message.Arguments)
    testAPIArgument(argument as Partial<APIArgument>);

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
