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

    // Get padding
    const values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemPaddingArgName);
    if(values.length>=4){
        this.labelTD.style.paddingTop     = values[0].toString() + 'px';
        this.labelTD.style.paddingRight   = values[1].toString() + 'px';
        this.labelTD.style.paddingBottom  = values[2].toString() + 'px';
        this.labelTD.style.paddingLeft    = values[3].toString() + 'px';
    }

    // Get bold
    const bold: boolean = getBooleanArgumentValue(message, PortalDefs.itemBoldArgName);
    this.label.style.fontWeight = bold ? "bold" : "normal";

    // Create the HTML text input element
    this.label.innerHTML = innerHTML;
    this.labelTD.colSpan = 2;

    // Get color
    const color_values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemColorArgName);
    if(color_values.length>=3){
        this.label.style.color = "#" + (1 << 24 | color_values[0] << 16 | color_values[1] << 8 | color_values[2]).toString(16).slice(1);
    }

    // Get fontsize
    const font_size: Number = getNumericArgumentValue(message, PortalDefs.itemFontSize);
    this.label.style.fontSize = font_size + "px";

    // Append HTML elements
    this.tr.removeChild(this.contentTD)
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

    // Get padding
    const padding_values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemPaddingArgName);
    if(padding_values.length>=4){
        this.labelTD.style.paddingTop     = padding_values[0].toString() + 'px';
        this.labelTD.style.paddingRight   = padding_values[1].toString() + 'px';
        this.labelTD.style.paddingBottom  = padding_values[2].toString() + 'px';
        this.labelTD.style.paddingLeft    = padding_values[3].toString() + 'px';
    }

    // Get color
    const color_values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemColorArgName);
    if(color_values.length>=3){
        this.label.style.color = "#" + (1 << 24 | color_values[0] << 16 | color_values[1] << 8 | color_values[2]).toString(16).slice(1);
    }

    // Get bold
    const bold: boolean = getBooleanArgumentValue(message, PortalDefs.itemBoldArgName);
    this.label.style.fontWeight = bold ? "bold" : "normal";

    // Get fontsize
    const font_size: Number = getNumericArgumentValue(message, PortalDefs.itemFontSize);
    this.label.style.fontSize = font_size + "px";

    return true;
  }

  protected replaceAllLineBreaks(value: string): string{
    return value.replace(/(\r\n|\r|\n)/g, '<br>');
  }
}
