// Local Includes
import { APIMessage } from './types';


/**
 * NAPPortalItem
 */
export class NAPPortalItem extends EventTarget {

  protected readonly id: string;        ///< This NAPPortalItem's id
  protected readonly name: string;      ///< This NAPPortalItem's name
  protected readonly td: HTMLElement;   ///< This NAPPortalItem's table cell element
  public readonly tr: HTMLElement;     ///< This NAPPortalItem's table row element

  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super();
    this.id = message.mID;
    this.name = message.Name;

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
}
