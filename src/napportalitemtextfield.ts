// Local Includes
import { NAPPortalItem } from './napportalitem';
import { getBooleanArgumentValue, getStringArgumentValue } from './utils';
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

    // Create the HTML text input element
    this.textInput = document.createElement('input');
    this.textInput.setAttribute('id', this.id);
    this.textInput.setAttribute('type', 'text');
    this.textInput.addEventListener('input', () => this.onTextInput());
    this.setTextInput(value);

    // Append HTML elements
    this.contentTD.appendChild(this.textInput);

    // update state
    this.updateState(message);
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public updateValue(message: APIMessage): void {
    // Update NapPortalItem base
    super.updateValue(message);

    const value: string = getStringArgumentValue(message, PortalDefs.itemValueArgName);
    this.setTextInput(value);
  }

  /**
   * Update the portal item state with an API message received from the server
   * @param message the API message containing the portal item value update
   * @returns true if a state change occurred
   */
  public updateState(message: APIMessage): void {
    super.updateState(message)

    this.textInput.disabled = !this.enabled;
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
