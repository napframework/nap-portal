// Local Includes
import { NAPPortalItem } from './napportalitem';
import {
  APIMessage,
  PortalDefs,
  PortalItemButtonEvent,
} from './types';
import { getBooleanArgumentValue, getNumericArrayArgumentValue } from './utils';


/**
 * NAPPortalItemSeperator
 */
export class NAPPortalItemSeperator extends NAPPortalItem {

  private readonly seperator: HTMLHRElement;  ///< The HTML HR Element

  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Create the HTML button element
    this.seperator = document.createElement('hr')
    this.seperator.setAttribute('id', this.id);

    // Get padding
    const values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemPaddingArgName);
    if(values.length>=4){
      this.contentTD.style.paddingTop     = values[0].toString() + 'px';
      this.contentTD.style.paddingRight   = values[1].toString() + 'px';
      this.contentTD.style.paddingBottom  = values[2].toString() + 'px';
      this.contentTD.style.paddingLeft    = values[3].toString() + 'px';
    }

    // Remove HTML label element
    this.contentTD.colSpan = 2;

    this.tr.removeChild(this.labelTD);
    this.contentTD.appendChild(this.seperator);
  }

  public updateState(message: APIMessage): boolean {
    super.updateState(message);

    const values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemPaddingArgName);
    if(values.length>=4){
        this.contentTD.style.paddingTop     = values[0].toString() + 'px';
        this.contentTD.style.paddingRight   = values[1].toString() + 'px';
        this.contentTD.style.paddingBottom  = values[2].toString() + 'px';
        this.contentTD.style.paddingLeft    = values[3].toString() + 'px';
    }

    return true;
  }
}
