// Local Includes
import {
  NAPPortalItem,
  NAPPortalItemEvent,
  NAPPortalItemUpdateDetail,
} from './napportalitem'
import {
  getArgumentByName,
  isIntegralArgumentType,
} from './utils';
import {
  PortalDefs,
  APIMessage,
  APIArgumentType,
  PortalItemUpdateInfo,
} from './types';
import {
  testAPIArgumentNumeric,
} from './validation';


/**
 * NAPPortalItemSlider
 */
export class NAPPortalItemSlider extends NAPPortalItem {

  private readonly valueInput: HTMLInputElement;  ///< The HTML input element to control the item's value
  private readonly valueSpan: HTMLElement;        ///< The HTML element displaying the item's current value
  private readonly valueType: APIArgumentType;    ///< The Type of the argument containing the portal item value
  private readonly isIntegral: boolean;           ///< Whether the value is integral or has decimals


  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    const minArg = getArgumentByName(message, PortalDefs.itemMinArgName);
    const maxArg = getArgumentByName(message, PortalDefs.itemMaxArgName);
    const valArg = getArgumentByName(message, PortalDefs.itemValueArgName);
    const minNumeric = testAPIArgumentNumeric(minArg);
    const maxNumeric = testAPIArgumentNumeric(maxArg);
    const valNumeric = testAPIArgumentNumeric(valArg);

    // Store type information
    this.valueType = valNumeric.Type;
    this.isIntegral = isIntegralArgumentType(this.valueType);

    // Create the range input element
    this.valueInput = document.createElement('input');
    this.valueInput.setAttribute('id', this.id);
    this.valueInput.setAttribute('type', 'range');
    this.valueInput.setAttribute('min', minNumeric.Value.toString());
    this.valueInput.setAttribute('max', maxNumeric.Value.toString());
    this.valueInput.setAttribute('step', this.isIntegral ? '1' : '0.001');
    this.valueInput.addEventListener('input', () => this.onInput());
    this.setValueInput(valNumeric.Value);

    // Create the span to display the value
    this.valueSpan = document.createElement('span');
    this.setValueSpan(valNumeric.Value);

    // Append HTML elements
    this.td.appendChild(this.valueInput);
    this.td.appendChild(this.valueSpan);
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public update(message: APIMessage): void {
    super.update(message);

    // Extract properties from API message
    const valArg = getArgumentByName(message, PortalDefs.itemValueArgName);
    const valNumeric = testAPIArgumentNumeric(valArg);

    // Update HTML elements
    this.setValueInput(valNumeric.Value);
    this.setValueSpan(valNumeric.Value);
  }


  /**
   * Called when the HTML input element receives input
   */
  private onInput(): void {
    // Create portal item update info
    const value = Number(this.valueInput.value);
    const info: PortalItemUpdateInfo = {
      id: this.id,
      name: this.name,
      type: this.valueType,
      value,
    };

    // Notify listeners of update
    const detail: NAPPortalItemUpdateDetail = { info };
    this.dispatchEvent(new CustomEvent(NAPPortalItemEvent.Update, { detail }));

    // Update displayed value
    this.setValueSpan(value);
  }


  /**
   * Update the value of the HTML input element
   * @param value the updated portal item value
   */
  private setValueInput(value: number): void {
    this.valueInput.value = value.toString();
  }


  /**
   * Update the HTML element displaying the value
   * @param value the updated portal item value
   */
  private setValueSpan(value: number): void {
    this.valueSpan.innerHTML = this.isIntegral ? value.toString() : value.toFixed(3);
  }
}
