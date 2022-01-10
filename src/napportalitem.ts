// Local Includes
import { getArgumentByName } from './utils';
import {
  PortalDefs,
  APIMessage,
  APIArgumentType,
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

  protected readonly id: string;            ///< This NAPPortalItem's id
  protected readonly name: string;          ///< This NAPPortalItem's name
  protected readonly type: APIArgumentType; ///< This NAPPortalItem's value argument type
  protected readonly td: HTMLElement;       ///< This NAPPortalItem's table cell element
  public readonly tr: HTMLElement;          ///< This NAPPortalItem's table row element


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
    const label = document.createElement('label');
    label.setAttribute('for', this.id);
    label.innerHTML = this.name;

    // Create label cell
    const labelTd = document.createElement('td');
    labelTd.appendChild(label);

    // Create content cell
    this.td = document.createElement('td');

    // Create row
    this.tr = document.createElement('tr');
    this.tr.appendChild(labelTd);
    this.tr.appendChild(this.td);
  }


  /**
   * Update the portal item with an API message received from the server.
   * Should be implemented by classes inheriting from NAPPortalItem.
   * @param message the API message containing the portal item update
   */
  public update(message: APIMessage): void {

  }
}
