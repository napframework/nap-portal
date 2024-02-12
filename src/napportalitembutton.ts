// Local Includes
import { toString } from 'lodash';
import { NAPPortalItem } from './napportalitem';
import {
  APIMessage,
  PortalDefs,
  PortalItemAlignment,
  PortalItemButtonEvent,
} from './types';
import { getBooleanArgumentValue, getTypeValue } from './utils';


/**
 * NAPPortalItemButton
 */
export class NAPPortalItemButton extends NAPPortalItem {

  private readonly button: HTMLButtonElement;  ///< The HTML button element which triggers the events
  private alignment: PortalItemAlignment = PortalItemAlignment.Right;

  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Create the HTML button element
    this.button = document.createElement('button');
    this.button.textContent = this.name;
    this.button.setAttribute('id', this.id);
    this.button.addEventListener('click', () => this.sendUpdate(PortalItemButtonEvent.Click));
    this.button.addEventListener('pointerdown', (event: PointerEvent) => this.onPointerDown(event));
    this.button.addEventListener('pointerup', (event: PointerEvent) => this.onPointerUp(event));
    this.button.addEventListener('pointerenter', (event: PointerEvent) => this.onPointerEnter(event));
    this.button.addEventListener('pointerleave', (event: PointerEvent) => this.onPointerLeave(event));

    this.labelTD.removeChild(this.label);

    // Update item state
    this.updateState(message);
  }

  /**
   * Update the portal item state with an API message received from the server
   * @param message the API message containing the portal item value update
   */
  public updateState(message: APIMessage): void {
    super.updateState(message);

    // button enabled / disabled state
    this.button.disabled = !this.enabled;

    // button alignment state
    const alignment: PortalItemAlignment = getTypeValue<PortalItemAlignment>(message, PortalDefs.itemAlignmentArgName);
    this.alignment = alignment;
    switch(this.alignment){
        case PortalItemAlignment.Left:
          if(this.button.parentNode==this.contentTD)
            this.contentTD.removeChild(this.button);
          if(this.button.parentNode!=this.labelTD)
            this.labelTD.appendChild(this.button);
          break;
        case PortalItemAlignment.Right:
          if(this.button.parentNode==this.labelTD)
            this.labelTD.removeChild(this.button);
          if(this.button.parentNode!=this.contentTD)
            this.contentTD.appendChild(this.button);
          break;
        default:
          throw "error! alignment type not found!";
    }

    //
    const highlight: boolean = getBooleanArgumentValue(message, PortalDefs.itemHighLightArgName);
    if(highlight)
      this.button.classList.add("highlight");
    else
      this.button.classList.remove("highlight");
  }


  /**
   * Called when the button triggers a pointerdown event
   * Trigger press event for the primary pointer and button
   */
  private onPointerDown(event: PointerEvent): void {
    if (event.isPrimary && event.button === 0)
      this.sendUpdate(PortalItemButtonEvent.Press);
  }


  /**
   * Called when the button triggers a pointerup event
   * Trigger release event for the primary pointer and button
   */
  private onPointerUp(event: PointerEvent): void {
    if (event.isPrimary && event.button === 0)
      this.sendUpdate(PortalItemButtonEvent.Release);
  }


  /**
   * Called when the button triggers a pointerenter event
   * Trigger press event for the primary pointer if the button is still pressed
   */
  private onPointerEnter(event: PointerEvent): void {
    if (event.isPrimary && event.buttons & 1)
      this.sendUpdate(PortalItemButtonEvent.Press);
  }


  /**
   * Called when the button triggers a pointerleave event
   * Trigger release event for the primary pointer if the button is still pressed
   */
  private onPointerLeave(event: PointerEvent): void {
    if (event.isPrimary && event.buttons & 1)
      this.sendUpdate(PortalItemButtonEvent.Release);
  }
}
