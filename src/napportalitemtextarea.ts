// Local Includes
import { NAPPortalItem } from './napportalitem';
import { getStringArgumentValue } from './utils';
import {
  PortalDefs,
  APIMessage,
} from './types';


/**
 * NAPPortalItemTextArea
 */
export class NAPPortalItemTextArea extends NAPPortalItem {

  private readonly textArea: HTMLTextAreaElement;  ///< The HTML text area element to control the item's value


  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    const value: string = getStringArgumentValue(message, PortalDefs.itemValueArgName);

    // Create the HTML range input element
    this.textArea = document.createElement('textarea');
    this.textArea.setAttribute('id', this.id);
    this.textArea.setAttribute('rows', '10');
    this.textArea.addEventListener('input', () => this.onTextInput());
    this.setTextArea(value);

    // Append HTML elements
    this.contentTD.appendChild(this.textArea);
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public update(message: APIMessage): void {
    const value: string = getStringArgumentValue(message, PortalDefs.itemValueArgName);
    this.setTextArea(value);
  }


  /**
   * Called for the text input element input event
   */
  private onTextInput(): void {
    const value: string = this.textArea.value;
    this.sendUpdate(value);
  }


  /**
   * Sets the value of the HTML text input element
   * @param value the updated portal item value
   */
  private setTextArea(value: string): void {
    this.textArea.value = value;
  }
}
