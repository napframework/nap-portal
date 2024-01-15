// Local Includes
import { getArgumentByName } from './utils';
import { getBooleanArgumentValue } from './utils';
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
  UpdateValue = 'UPDATEVALUE',
  UpdateState = 'UPDATESTATE'
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
  protected visible: boolean;                         ///< This NAPPortalItem should be visible or not
  protected enabled: boolean;                         ///< This NAPPortalItem should be enabled or not
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

    // Extract visibility
    this.visible = getBooleanArgumentValue(message, PortalDefs.itemVisibleArgName);

    // Extract enabled
    this.enabled = getBooleanArgumentValue(message, PortalDefs.itemEnabledArgName);

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
    this.tr.hidden = !this.visible;
    this.tr.appendChild(this.labelTD);
    this.tr.appendChild(this.contentTD);
  }


  /**
   * Update the portal item with an API message received from the server.
   * Should be implemented by classes inheriting from NAPPortalItem.
   * @param message the API message containing the portal item update
   */
  public updateValue(message: APIMessage): void {}

  /**
   * Update the portal item state with an API message received from the server
   * @param message the API message containing the portal item value update
   * @returns true if a state change occurred
   */
  public updateState(message: APIMessage) : boolean{
    var state_changed: boolean = false;

    // Extract visibility
    var is_visible: boolean = getBooleanArgumentValue(message, PortalDefs.itemVisibleArgName);

    if(is_visible!=this.visible){
      this.visible = is_visible;
      this.tr.hidden = !this.visible;
      state_changed = true;
    }

    // Extract enabled
    var is_enabled: boolean = getBooleanArgumentValue(message, PortalDefs.itemEnabledArgName);
    if(is_enabled!=this.enabled){
      this.enabled = is_enabled;
      state_changed = true;
    }

    return state_changed;
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
    this.dispatchEvent(new CustomEvent(NAPPortalItemEvent.UpdateValue, { detail }));
  }
}
