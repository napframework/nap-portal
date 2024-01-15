// Local Includes
import { NAPPortalItem } from './napportalitem';
import { getBooleanArgumentValue } from './utils';
import {
  PortalDefs,
  APIMessage,
} from './types';


/**
 * NAPPortalItemToggle
 */
export class NAPPortalItemToggle extends NAPPortalItem {

  private readonly checkbox: HTMLInputElement;  ///< The HTML checkbox input element to control the item's value


  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    const value: boolean = getBooleanArgumentValue(message, PortalDefs.itemValueArgName);

    // Create the HTML checkbox input element
    this.checkbox = document.createElement('input');
    this.checkbox.setAttribute('id', this.id);
    this.checkbox.setAttribute('type', 'checkbox');
    this.checkbox.addEventListener('input', () => this.onCheckboxInput());
    this.setCheckbox(value);

    // Append HTML elements
    this.contentTD.appendChild(this.checkbox);

    // Update item state
    this.checkbox.disabled = !this.enabled;
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public updateValue(message: APIMessage): void {
    // Update NapPortalItem base
    super.updateValue(message);

    const value: boolean = getBooleanArgumentValue(message, PortalDefs.itemValueArgName);
    this.setCheckbox(value);
  }

  /**
   * Update the portal item state with an API message received from the server
   * @param message the API message containing the portal item value update
   * @returns true if a state change occurred
   */
  public updateState(message: APIMessage): boolean {
    if(super.updateState(message)){
      this.checkbox.disabled = !this.enabled;
      return true;
    }

    return false;
  }


  /**
   * Called for the checkbox input element input event
   */
  private onCheckboxInput(): void {
    const value: boolean = this.checkbox.checked;
    this.sendUpdate(value);
  }


  /**
   * Sets the value of the HTML checkbox input element
   * @param value the updated portal item value
   */
  private setCheckbox(value: boolean): void {
    this.checkbox.checked = value;
  }
}
