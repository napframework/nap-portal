// Local Includes
import { NAPPortalItem } from './napportalitem';
import { getBooleanArgumentValue, getNumericArgumentValue, getNumericArrayArgumentValue, getStringArgumentValue } from './utils';
import {
  PortalDefs,
  APIMessage,
} from './types';
import { iteratee } from 'lodash';


/**
 * NAPPortalItemTextField
 */
export class NAPPortalItemLabel extends NAPPortalItem {
  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    const value: string = getStringArgumentValue(message, PortalDefs.itemValueArgName);
    const innerHTML: string = this.replaceAllLineBreaks(value);

    // Create the HTML text input element
    this.label.innerHTML = innerHTML;
    this.labelTD.colSpan = 2;

    // Append HTML elements
    this.tr.removeChild(this.contentTD)

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

    const value: string = getStringArgumentValue(message, PortalDefs.itemValueArgName);
    const innerHTML: string = this.replaceAllLineBreaks(value);
    this.label.innerHTML = innerHTML;
  }

  public updateState(message: APIMessage): boolean {
    super.updateState(message);

    // Get color
    const color_values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemColorArgName);
    if(color_values.length>=3){
        this.label.style.color = "#" + (1 << 24 | color_values[0] << 16 | color_values[1] << 8 | color_values[2]).toString(16).slice(1);
    }

    // Get font weight
    const font_weight: Number = getNumericArgumentValue(message, PortalDefs.itemFontWeightArgName);
    this.label.style.fontWeight = font_weight.toString();

    // Get fontsize
    const font_size: Number = getNumericArgumentValue(message, PortalDefs.itemFontSizeArgName);
    this.label.style.fontSize = font_size + "px";

    // Extract selected
    const selected: boolean = getBooleanArgumentValue(message, PortalDefs.itemSelectedArgName);
    if(selected)
      this.label.classList.add("selected");
    else
      this.label.classList.remove("selected");

    return true;
  }

  protected replaceAllLineBreaks(value: string): string{
    return value.replace(/(\r\n|\r|\n)/g, '<br>');
  }
}
