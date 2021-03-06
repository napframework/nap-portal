// Local Includes
import { getArgumentByName } from './utils';
import {
  PortalDefs,
  APIMessage,
  APIArgumentType,
  APIArgumentValue,
  PortalItemUpdateInfo,
} from './types';


/**
 * Events emitted by NAPPortalItem
 */
 export enum NAPPortalItemEvent {
  Update = 'UPDATE',
};


/**
 * Detail sent with NAPPortalItemEvent.Update events
 */
 export interface NAPPortalItemUpdateDetail {
  info: PortalItemUpdateInfo;
};


/**
 * NAPPortalItem
 */
export class NAPPortalItem extends EventTarget {

  protected readonly id: string;                      ///< This NAPPortalItem's id
  protected readonly name: string;                    ///< This NAPPortalItem's name
  protected readonly type: APIArgumentType;           ///< This NAPPortalItem's value argument type
  protected readonly label: HTMLLabelElement;         ///< This NAPPortalItem's html label element
  protected readonly labelTD: HTMLTableCellElement;   ///< This NAPPortalItem's table cell element containing the label
  protected readonly contentTD: HTMLTableCellElement; ///< This NAPPortalItem's table cell element containing the content
  public readonly tr: HTMLTableRowElement;            ///< This NAPPortalItem's table row element


  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super();
    this.id = message.mID;
    this.name = message.Name;

    // Extract value type
    this.type = getArgumentByName(message, PortalDefs.itemValueArgName).Type;

    // Create label
    this.label = document.createElement('label');
    this.label.setAttribute('for', this.id);
    this.label.innerHTML = this.name;

    // Create label cell
    this.labelTD = document.createElement('td');
    this.labelTD.appendChild(this.label);

    // Create content cell
    this.contentTD = document.createElement('td');

    // Create row
    this.tr = document.createElement('tr');
    this.tr.className = this.id;
    this.tr.appendChild(this.labelTD);
    this.tr.appendChild(this.contentTD);
  }


  /**
   * Update the portal item with an API message received from the server.
   * Should be implemented by classes inheriting from NAPPortalItem.
   * @param message the API message containing the portal item update
   */
  public update(message: APIMessage): void {
    console.warn(`No need to call NAPPortalItem::update() base class method`);
  }


  /**
   * Notify listeners of a portal item update for the NAP application
   * @param value the value to send with the portal item update
   */
  protected sendUpdate(value: APIArgumentValue): void {
    const info: PortalItemUpdateInfo = {
      id: this.id,
      name: this.name,
      type: this.type,
      value,
    };
    const detail: NAPPortalItemUpdateDetail = { info };
    this.dispatchEvent(new CustomEvent(NAPPortalItemEvent.Update, { detail }));
  }
}
