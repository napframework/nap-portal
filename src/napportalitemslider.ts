// Local Includes
import { NAPPortalItem } from './napportalitem';
import {
  getBooleanArgumentValue,
  getNumericArgumentValue,
  isIntegralArgumentType,
} from './utils';
import {
  PortalDefs,
  APIMessage,
} from './types';


/**
 * NAPPortalItemSlider
 */
export class NAPPortalItemSlider extends NAPPortalItem {

  private readonly rangeInput: HTMLInputElement;  ///< The HTML range input element to control the item's value
  private readonly numberInput: HTMLInputElement; ///< The HTML number input element to control the item's value
  private readonly min: number;                   ///< The minimum value of the portal item
  private readonly max: number;                   ///< The maximum value of the portal item
  private readonly isIntegral: boolean;           ///< Whether the value is integral or floating point


  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    this.min = getNumericArgumentValue(message, PortalDefs.itemMinArgName);
    this.max = getNumericArgumentValue(message, PortalDefs.itemMaxArgName);
    this.isIntegral = isIntegralArgumentType(this.type);
    const value: number = getNumericArgumentValue(message, PortalDefs.itemValueArgName);

    // Create HTML table elements
    const table: HTMLTableElement = document.createElement('table');
    const tbody: HTMLTableSectionElement = document.createElement('tbody');
    const tr: HTMLTableRowElement = document.createElement('tr');
    const td1: HTMLTableCellElement = document.createElement('td');
    const td2: HTMLTableCellElement = document.createElement('td');

    // Create the HTML range input element
    this.rangeInput = document.createElement('input');
    this.rangeInput.setAttribute('type', 'range');
    this.rangeInput.setAttribute('min', this.min.toFixed(this.isIntegral ? 0 : 3));
    this.rangeInput.setAttribute('max', this.max.toFixed(this.isIntegral ? 0 : 3));
    this.rangeInput.setAttribute('step', this.isIntegral ? '1' : '0.001');
    this.rangeInput.addEventListener('input', () => this.onRangeInput());
    this.setRangeInput(value);

    // Create the span to display the value
    this.numberInput = document.createElement('input');
    this.numberInput.setAttribute('id', this.id);
    this.numberInput.setAttribute('type', 'number');
    this.numberInput.setAttribute('min', this.min.toFixed(this.isIntegral ? 0 : 3));
    this.numberInput.setAttribute('max', this.max.toFixed(this.isIntegral ? 0 : 3));
    this.numberInput.setAttribute('step', this.isIntegral ? '1' : '0.001');
    this.numberInput.addEventListener('input', () => this.onNumberInput());
    this.numberInput.addEventListener('change', () => this.onNumberChange());
    this.setNumberInput(value);

    // Append HTML elements
    td1.appendChild(this.rangeInput);
    td2.appendChild(this.numberInput);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tbody.appendChild(tr);
    table.appendChild(tbody);
    this.contentTD.appendChild(table);

    // Update item state
    this.rangeInput.disabled = !this.enabled;
    this.numberInput.disabled = !this.enabled;
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public updateValue(message: APIMessage): void {
    // Update NapPortalItem base
    super.updateValue(message);

    const value: number = getNumericArgumentValue(message, PortalDefs.itemValueArgName);
    this.setRangeInput(value);
    this.setNumberInput(value);
  }

  /**
   * Update the portal item state with an API message received from the server
   * @param message the API message containing the portal item value update
   * @returns true if a state change occurred
   */
  public updateState(message: APIMessage): boolean {
    if(super.updateState(message)){
      this.rangeInput.disabled = !this.enabled;
      this.numberInput.disabled = !this.enabled;
      return true;
    }

    return false;
  }


  /**
   * Called for the range input element input event
   */
  private onRangeInput(): void {
    const value: number = Number(this.rangeInput.value);
    this.setNumberInput(value);
    this.sendUpdate(value);
  }


  /**
   * Called for the number input element input event
   */
  private onNumberInput(): void {
    const value: number = Number(this.numberInput.value);
    this.setRangeInput(value);
    this.sendUpdate(value);
  }


  /**
   * Called for the number input element change event
   */
  private onNumberChange(): void {
    const value: number = Number(this.numberInput.value);
    const clamped: number = Math.min(this.max, Math.max(this.min, value));
    this.setNumberInput(clamped);
    this.setRangeInput(clamped);
    this.sendUpdate(clamped);
  }


  /**
   * Sets the value of the HTML range input element
   * @param value the updated portal item value
   */
  private setRangeInput(value: number): void {
    this.rangeInput.value = value.toFixed(this.isIntegral ? 0 : 3);
  }


  /**
   * Sets the value of the HTML number input element
   * @param value the updated portal item value
   */
  private setNumberInput(value: number): void {
    this.numberInput.value = value.toFixed(this.isIntegral ? 0 : 3);
  }
}
