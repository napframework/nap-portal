// Local Includes
import { NAPPortalItem } from './napportalitem';
import {
  getBooleanArgumentValue,
  getNumericArgumentValue,
  getNumericArrayArgumentValue,
  isIntegralArrayArgumentType,
} from './utils';
import {
  PortalDefs,
  APIMessage,
} from './types';

const labels: Array<string> = ['X', 'Y', 'Z', 'W'];

/**
 * NAPPortalItemVector
 */
export class NAPPortalItemVector extends NAPPortalItem {

  private readonly numberInputs: Array<HTMLInputElement> = [];  ///< The HTML number input elements to control the vector's values
  private readonly min: number;                                 ///< The minimum value of a vector axis
  private readonly max: number;                                 ///< The maximum value of a vector axis
  private readonly clamp: boolean;                              ///< Whether to clamp the value to min / max
  private readonly isIntegral: boolean;                         ///< Whether the value is integral or floating point


  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    this.min = getNumericArgumentValue(message, PortalDefs.itemMinArgName);
    this.max = getNumericArgumentValue(message, PortalDefs.itemMaxArgName);
    this.clamp = getBooleanArgumentValue(message, PortalDefs.itemClampArgName);
    this.isIntegral = isIntegralArrayArgumentType(this.type);
    const values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemValueArgName);

    // Create HTML table elements
    const table: HTMLTableElement = document.createElement('table');
    const tbody: HTMLTableSectionElement = document.createElement('tbody');
    const tr: HTMLTableRowElement = document.createElement('tr');

    values.forEach((value: number, index: number) => {
      const id: string = `${this.id}-${labels[index].toLowerCase()}`;

      // Create HTML label element
      const label: HTMLLabelElement = document.createElement('label');
      label.setAttribute('for', id);
      label.innerHTML = labels[index];

      // Create HTML number input element
      const numberInput = document.createElement('input');
      numberInput.setAttribute('id', id);
      numberInput.setAttribute('type', 'number');
      numberInput.setAttribute('min', this.min.toFixed(this.isIntegral ? 0 : 3));
      numberInput.setAttribute('max', this.max.toFixed(this.isIntegral ? 0 : 3));
      numberInput.setAttribute('step', this.isIntegral ? '1' : '0.001');
      numberInput.addEventListener('input', () => this.onNumberInput());
      numberInput.addEventListener('change', () => this.onNumberChange());
      this.numberInputs.push(numberInput);

      // Append HTML label element
      const labelTD: HTMLTableCellElement = document.createElement('td');
      labelTD.appendChild(label);
      tr.appendChild(labelTD);

      // Append HTML number input element
      const numberInputTD: HTMLTableCellElement = document.createElement('td');
      numberInputTD.appendChild(numberInput);
      tr.appendChild(numberInputTD);
    });

    // Set initial time values
    this.setNumberInputs(values);

    // Append HTML table elements
    tbody.appendChild(tr);
    table.appendChild(tbody);
    this.contentTD.appendChild(table);

    // Update item state
    this.numberInputs.forEach(element => {
      element.disabled = !this.enabled;
    })
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public updateValue(message: APIMessage): void {
    // Update NapPortalItem base
    super.updateValue(message);

    const values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemValueArgName);
    this.setNumberInputs(values);
  }

  /**
   * Update the portal item state with an API message received from the server
   * @param message the API message containing the portal item value update
   * @returns true if a state change occurred
   */
  public updateState(message: APIMessage): boolean {
    if(super.updateState(message)){
      this.numberInputs.forEach(element => {
        element.disabled = !this.enabled;
      })
      return true;
    }

    return false;
  }


  /**
   * Called for the number input element input event
   */
  private onNumberInput(): void {
    const values: Array<number> = this.numberInputs.map(input => Number(input.value));
    this.sendUpdate(values);
  }


  /**
   * Called for the number input element change event
   */
  private onNumberChange(): void {
    const values: Array<number> = this.numberInputs.map(input => {
      const value = Number(input.value);
      return this.clamp ? Math.min(this.max, Math.max(this.min, value)) : value;
    });
    this.setNumberInputs(values);
    this.sendUpdate(values);
  }


  /**
   * Sets the value of the HTML color input element
   * @param values the updated color channel values
   */
  private setNumberInputs(values: Array<number>): void {
    this.numberInputs.forEach((input, index) => input.value = values[index].toFixed(this.isIntegral ? 0 : 3));
  }
}
