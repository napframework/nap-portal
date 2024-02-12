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
export class NAPPortalItemSeparator extends NAPPortalItem {

  private readonly seperator: HTMLHRElement;  ///< The HTML HR Element

  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Create the HTML button element
    this.seperator = document.createElement('hr')
    this.seperator.setAttribute('id', this.id);

    // Remove HTML label element
    this.contentTD.colSpan = 2;

    this.tr.removeChild(this.labelTD);
    this.contentTD.appendChild(this.seperator);

    // Update item state
    this.updateState(message);
  }

  public updateState(message: APIMessage): void {
    super.updateState(message);
  }
}
