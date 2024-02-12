// Local Includes
import { NAPPortalItem } from './napportalitem';
import {
  getNumericArrayArgumentValue,
  isFloatArrayArgumentType,
  hexToRgb,
  rgbToHex,
  getBooleanArgumentValue,
} from './utils';
import {
  PortalDefs,
  APIMessage,
} from './types';


/**
 * NAPPortalItemColor
 */
export class NAPPortalItemColor extends NAPPortalItem {

  private readonly colorInput: HTMLInputElement;  ///< The HTML color input element to control the item's value
  private readonly alphaInput?: HTMLInputElement; ///< The HTML alpha input element to control the item's value
  private readonly isFloat: boolean;              ///< Indicates whether the color values are floats


  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    const values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemValueArgName);
    this.isFloat = isFloatArrayArgumentType(this.type);

    // Create HTML table elements
    const table: HTMLTableElement = document.createElement('table');
    const tbody: HTMLTableSectionElement = document.createElement('tbody');
    const tr: HTMLTableRowElement = document.createElement('tr');

    // Create HTML color input element
    this.colorInput = document.createElement('input');
    this.colorInput.setAttribute('id', this.id);
    this.colorInput.setAttribute('type', 'color');
    this.colorInput.addEventListener('input', () => this.onColorInput());

    // Append HTML color input element
    const colorTD: HTMLTableCellElement = document.createElement('td');
    colorTD.appendChild(this.colorInput);
    tr.appendChild(colorTD);

    if (values.length > 3) {
      // Create HTML alpha label element
      const alphaLabel: HTMLLabelElement = document.createElement('label');
      alphaLabel.setAttribute('for', `${this.id}-alpha`);
      alphaLabel.innerHTML = 'Alpha';

      // Create HTML alpha input element
      this.alphaInput = document.createElement('input');
      this.alphaInput.setAttribute('id', `${this.id}-alpha`);
      this.alphaInput.setAttribute('type', 'number');
      this.alphaInput.setAttribute('min', '0');
      this.alphaInput.setAttribute('max', this.isFloat ? '1' : '255');
      this.alphaInput.setAttribute('step', this.isFloat ? '0.001' : '1');
      this.alphaInput.addEventListener('input', () => this.onColorInput());

      // Append HTML alpha label element
      const alphaLabelTD: HTMLTableCellElement = document.createElement('td');
      alphaLabelTD.appendChild(alphaLabel);
      tr.appendChild(alphaLabelTD);

      // Append HTML alpha input element
      const alphaInputTD: HTMLTableCellElement = document.createElement('td');
      alphaInputTD.appendChild(this.alphaInput);
      tr.appendChild(alphaInputTD);
    }

    // Set initial time values
    this.setColorInput(values);

    // Append HTML table elements
    tbody.appendChild(tr);
    table.appendChild(tbody);
    this.contentTD.appendChild(table);

    // Update item state
    this.updateState(message);
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public updateValue(message: APIMessage): void {
    // Update NapPortalItem base
    super.updateValue(message);

    const values: Array<number> = getNumericArrayArgumentValue(message, PortalDefs.itemValueArgName);
    this.setColorInput(values);
  }


  public updateState(message: APIMessage): void {
    super.updateState(message);

    this.colorInput.disabled = !this.enabled;
    if(this.alphaInput!=undefined)
      this.alphaInput.disabled = !this.enabled;
  }

  /**
   * Called for the color input element input event
   */
  private onColorInput(): void {
    const values: Array<number> = hexToRgb(this.colorInput.value);
    const output: Array<number> = this.isFloat ? values.map(v => v / 255) : values;

    if (this.alphaInput)
      output.push(Number(this.alphaInput.value));

    this.sendUpdate(output);
  }


  /**
   * Sets the value of the HTML color input element
   * @param values the updated color channel values
   */
  private setColorInput(values: Array<number>): void {
    const input = this.isFloat ? values.map(v => Math.round(v * 255)) : values;
    this.colorInput.value = rgbToHex(input);

    if (this.alphaInput && values.length > 3) {
      this.alphaInput.value = values[3].toFixed(this.isFloat ? 3 : 0);
    }
  }
}
