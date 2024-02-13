// Local Includes
import { getArgumentByName, getNumericArrayArgumentValue } from './utils';
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
  public updateState(message: APIMessage) : void{
    // Extract visibility
    const is_visible: boolean = getBooleanArgumentValue(message, PortalDefs.itemVisibleArgName);
    if(is_visible!=this.visible){
      this.visible = is_visible;
      this.tr.hidden = !this.visible;
    }

    // Extract enabled
    const is_enabled: boolean = getBooleanArgumentValue(message, PortalDefs.itemEnabledArgName);
    if(is_enabled!=this.enabled){
      this.enabled = is_enabled;
    }

    // Extract padding
    const values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemPaddingArgName);
    if(values.length>=2){
      if(values[0] > 0){
        this.contentTD.style.paddingTop     = values[0].toString() + 'px';
        this.labelTD.style.paddingTop = this.contentTD.style.paddingTop;
      }
      
      if(values[1] > 0){
        this.contentTD.style.paddingBottom  = values[1].toString() + 'px';
        this.labelTD.style.paddingBottom = this.contentTD.style.paddingBottom;
      }
    }
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
