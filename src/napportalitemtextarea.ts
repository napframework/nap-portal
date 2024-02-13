// Local Includes
import { NAPPortalItem } from './napportalitem';
import { getBooleanArgumentValue, getStringArgumentValue } from './utils';
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

    // Create the HTML text area element
    this.textArea = document.createElement('textarea');
    this.textArea.setAttribute('id', this.id);
    this.textArea.rows = 5;
    this.textArea.addEventListener('input', () => this.onTextInput());
    this.setTextArea(value);

    // Append HTML elements
    this.contentTD.appendChild(this.textArea);

    // update state
    this.updateState(message);
  }


  /**
   * Update the portal item value with an API message received from the server
   * @param message the API message containing the portal item value update
   */
  public updateValue(message: APIMessage): void {
    // Update NapPortalItem base
    super.updateValue(message);

    const value: string = getStringArgumentValue(message, PortalDefs.itemValueArgName);
    this.setTextArea(value);
  }

  /**
   * Update the portal item state with an API message received from the server
   * @param message the API message containing the portal item value update
   */
  public updateState(message: APIMessage): void {
    this.textArea.disabled = !this.enabled;

    // Extract selected
    const selected: boolean = getBooleanArgumentValue(message, PortalDefs.itemSelectedArgName);
    if(selected)
      this.textArea.classList.add("selected");
    else
      this.textArea.classList.remove("selected");
  }


  /**
   * Called for the text input element input event
   */
  private onTextInput(): void {
    const value: string = this.textArea.value;
    this.textArea.style.height = this.textArea.scrollHeight + "px";
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
