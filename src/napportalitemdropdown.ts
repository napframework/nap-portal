// Local Includes
import { NAPPortalItem, NAPPortalItemEvent, NAPPortalItemUpdateDetail } from './napportalitem';
import { getNumericArgumentValue, getStringArrayArgumentValue, getArgumentByName, getBooleanArgumentValue } from './utils';
import {
  PortalDefs,
  APIMessage
} from './types';
import { forEach } from 'lodash';
import { testAPIArgumentNumeric } from './validation';


/**
 * NAPPortalItemDropdown
 */
export class NAPPortalItemDropdown extends NAPPortalItem {

  private readonly dropdown: HTMLSelectElement;  ///< The HTML checkbox input element to control the item's value

  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    const options: string[] = getStringArrayArgumentValue(message, PortalDefs.dropDownItemNames);

    // Extract selection
    const selection: number = getNumericArgumentValue(message, PortalDefs.itemValueArgName);

    // Create the HTML checkbox input element
    this.dropdown = document.createElement('select');
    this.dropdown.setAttribute('id', this.id);
    var idx = 0;
    options.forEach( option => {
      const opt = document.createElement("option");
      opt.value = idx.toString();
      opt.text = option;
      this.dropdown.add(opt);
      this.dropdown.disabled = !this.enabled;
      idx += 1;
    });

    // Set selected index
    this.dropdown.selectedIndex = selection;

    // Append listener
    this.dropdown.onchange = ()=> { 
      this.onSelectionChange();
    };

    // Append HTML elements
    this.contentTD.appendChild(this.dropdown);

    // Update item state
    this.updateState(message);
  }

  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public updateValue(message: APIMessage): void {
    // Update NapPortalItem base
    super.updateValue(message);

    // Extract properties from API message
    const options: string[] = getStringArrayArgumentValue(message, PortalDefs.dropDownItemNames);

    // Extract selection
    const selection: number = getNumericArgumentValue(message, PortalDefs.itemValueArgName);

    // Remove options
    this.removeOptions();

    // Reconstruct the options
    var idx = 0;
    options.forEach( option => {
      const opt = document.createElement("option");
      opt.value = idx.toString();
      opt.text = option;
      this.dropdown.add(opt);
      idx += 1;
    });

    // Set selected index
    this.dropdown.selectedIndex = selection;
  }

  /**
   * Update the portal item state with an API message received from the server
   * @param message the API message containing the portal item value update
   */
  public updateState(message: APIMessage): void {
    super.updateState(message);

    this.dropdown.disabled = !this.enabled;
  }

  /**
   * Send selected index as change
   */
  private onSelectionChange(): void{
    this.sendUpdate(this.dropdown.selectedIndex);
  }

  /**
   * Utility functions to remove all options from the dropdown
   */
  private removeOptions(): void {
    var i, L = this.dropdown.options.length - 1;
    for(i = L; i >= 0; i--) {
      this.dropdown.remove(i);
    }
 }
}
