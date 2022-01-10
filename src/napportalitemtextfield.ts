// Local Includes
import { NAPPortalItem } from './napportalitem';
import { getStringArgumentValue } from './utils';
import {
  PortalDefs,
  APIMessage,
} from './types';


/**
 * NAPPortalItemTextField
 */
export class NAPPortalItemTextField extends NAPPortalItem {

  private readonly textInput: HTMLInputElement;  ///< The HTML text input element to control the item's value


  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    const value: string = getStringArgumentValue(message, PortalDefs.itemValueArgName);

    // Create the HTML range input element
    this.textInput = document.createElement('input');
    this.textInput.setAttribute('id', this.id);
    this.textInput.setAttribute('type', 'text');
    this.textInput.addEventListener('input', () => this.onTextInput());
    this.setTextInput(value);

    // Append HTML elements
    this.td.appendChild(this.textInput);
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public update(message: APIMessage): void {
    const value: string = getStringArgumentValue(message, PortalDefs.itemValueArgName);
    this.setTextInput(value);
  }


  /**
   * Called for the text input element input event
   */
  private onTextInput(): void {
    const value: string = this.textInput.value;
    this.sendUpdate(value);
  }


  /**
   * Sets the value of the HTML text input element
   * @param value the updated portal item value
   */
  private setTextInput(value: string): void {
    this.textInput.value = value;
  }
}
