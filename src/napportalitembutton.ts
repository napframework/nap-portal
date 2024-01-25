// Local Includes
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
  private alignment: PortalItemAlignment;

  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Create the HTML button element
    this.button = document.createElement('button');
    this.button.textContent = this.name;
    this.button.disabled = !this.enabled;
    this.button.setAttribute('id', this.id);
    this.button.addEventListener('click', () => this.sendUpdate(PortalItemButtonEvent.Click));
    this.button.addEventListener('pointerdown', (event: PointerEvent) => this.onPointerDown(event));
    this.button.addEventListener('pointerup', (event: PointerEvent) => this.onPointerUp(event));
    this.button.addEventListener('pointerenter', (event: PointerEvent) => this.onPointerEnter(event));
    this.button.addEventListener('pointerleave', (event: PointerEvent) => this.onPointerLeave(event));

    this.labelTD.removeChild(this.label);

    // Update item state
    super.updateState(message);
    this.alignment = getTypeValue<PortalItemAlignment>(message, PortalDefs.itemAlignment);
    switch(this.alignment){
        case PortalItemAlignment.Left:
          this.labelTD.appendChild(this.button);
          break;
        case PortalItemAlignment.Right:
          this.contentTD.appendChild(this.button);
          break;
        default:
          throw "error!";
    }
  }

  /**
   * Update the portal item state with an API message received from the server
   * @param message the API message containing the portal item value update
   * @returns true if a state change occurred
   */
  public updateState(message: APIMessage): boolean {
    super.updateState(message);

    this.button.disabled = !this.enabled;
    const alignment: PortalItemAlignment = getTypeValue<PortalItemAlignment>(message, PortalDefs.itemAlignment);
    if(alignment!=this.alignment){
      this.alignment = alignment;
      switch(this.alignment){
          case PortalItemAlignment.Left:
            this.contentTD.removeChild(this.button);
            this.labelTD.appendChild(this.button);
            break;
          case PortalItemAlignment.Right:
            this.labelTD.removeChild(this.button);
            this.contentTD.appendChild(this.button);
            break;
            default:
              throw "error!";
      }
    }

    return true;
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
