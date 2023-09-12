// Local Includes
import { NAPPortalItem } from './napportalitem';
import {
  APIMessage,
  PortalItemButtonEvent,
} from './types';


/**
 * NAPPortalItemButton
 */
export class NAPPortalItemButton extends NAPPortalItem {

  private readonly button: HTMLButtonElement;  ///< The HTML button element which triggers the events


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

    // Append HTML elements
    this.contentTD.appendChild(this.button);

    // Remove HTML label element
    this.labelTD.removeChild(this.label);
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public update(message: APIMessage): void {
    // Ignore incoming button events
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
