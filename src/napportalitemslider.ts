// Local Includes
import { NAPPortalItem } from './napportalitem';
import {
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


  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    this.min = getNumericArgumentValue(message, PortalDefs.itemMinArgName);
    this.max = getNumericArgumentValue(message, PortalDefs.itemMaxArgName);
    const value = getNumericArgumentValue(message, PortalDefs.itemValueArgName);
    const isIntegral = isIntegralArgumentType(this.type);

    // Create the HTML range input element
    this.rangeInput = document.createElement('input');
    this.rangeInput.setAttribute('type', 'range');
    this.rangeInput.setAttribute('min', this.min.toString());
    this.rangeInput.setAttribute('max', this.max.toString());
    this.rangeInput.setAttribute('step', isIntegral ? '1' : '0.001');
    this.rangeInput.addEventListener('input', () => this.onRangeInput());
    this.setRangeInput(value);

    // Create the span to display the value
    this.numberInput = document.createElement('input');
    this.numberInput.setAttribute('id', this.id);
    this.numberInput.setAttribute('type', 'number');
    this.numberInput.setAttribute('min', this.min.toString());
    this.numberInput.setAttribute('max', this.max.toString());
    this.numberInput.setAttribute('step', isIntegral ? '1' : '0.001');
    this.numberInput.addEventListener('change', () => this.onNumberChange());
    this.setNumberInput(value);

    // Append HTML elements
    this.td.appendChild(this.rangeInput);
    this.td.appendChild(this.numberInput);
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public update(message: APIMessage): void {
    const value = getNumericArgumentValue(message, PortalDefs.itemValueArgName);
    this.setRangeInput(value);
    this.setNumberInput(value);
  }


  /**
   * Called for the range input element input event
   */
  private onRangeInput(): void {
    const value = Number(this.rangeInput.value);
    this.setNumberInput(value);
    this.sendUpdate(value);
  }


  /**
   * Called for the number input element change event
   */
  private onNumberChange(): void {
    const value = Number(this.numberInput.value);
    const clamped = Math.min(this.max, Math.max(this.min, value));
    this.setNumberInput(clamped);
    this.setRangeInput(clamped);
    this.sendUpdate(clamped);
  }


  /**
   * Sets the value of the HTML range input element
   * @param value the updated portal item value
   */
  private setRangeInput(value: number): void {
    this.rangeInput.value = value.toString();
  }


  /**
   * Sets the value of the HTML number input element
   * @param value the updated portal item value
   */
  private setNumberInput(value: number): void {
    this.numberInput.value = value.toString();
  }
}
