// Local Includes
import {
  APIMessage,
  PortalEventType,
  PortalItemUpdateInfo,
} from './types';
import {
  createPortalItem,
  getPortalItemUpdate,
} from './utils';
import {
  NAPWebSocket,
  NAPWebSocketEvent,
  NAPWebSocketMessageDetail,
} from './napwebsocket';
import {
  NAPPortalItem,
  NAPPortalItemEvent,
  NAPPortalItemUpdateDetail,
} from './napportalitem';

// External Includes
import { v4 as uuidv4 } from 'uuid';


/**
 * NAPPortalConfig
 * The config that is passed to the NAPPortal constructor
 */
export interface NAPPortalConfig {
  el: HTMLElement;              ///< The HTML element into which the interface will be injected
  portalId: string;             ///< The portal ID, should match with a PortalComponent ID in Napkin
  napWebSocket: NAPWebSocket;   ///< The NAPWebSocket used for communication with the NAP application
}


/**
 * NAPPortal
 * Creates a control interface for a single NAP application
 */
export class NAPPortal {

  private readonly uuid: string;                                ///< Unique ID for this NAPPortal instance
  private readonly config: NAPPortalConfig;                     ///< The config passed in the NAPPortal constructor
  private readonly portalItems: Map<string, NAPPortalItem>;     ///< The portal items contained by this NAPPortal, mapped by id
  private          portalItemAbortController: AbortController;  ///< Signals the NAPPortalItem event targets to remove listeners
  private readonly webSocketAbortController: AbortController;   ///< Signals the NAPWebSocket event target to remove listeners
  private readonly table: HTMLTableElement;                     ///< The table which is added to the element provided in config
  private readonly tbody: HTMLTableSectionElement;              ///< The table body which contains our portal item rows


  /**
   * Constructor
   * @param config the configuration for this NAPPortal
   */
  constructor(config: NAPPortalConfig) {
    this.uuid = uuidv4();
    this.config = config;
    this.portalItems = new Map<string, NAPPortalItem>();
    this.portalItemAbortController = new AbortController();
    this.webSocketAbortController = new AbortController();
    this.table = document.createElement('table');
    this.tbody = document.createElement('tbody');

    // Add HTML elements
    this.table.appendChild(this.tbody);
    this.config.el.appendChild(this.table);

    // Request portal if WebSocket is open
    if (this.config.napWebSocket.isOpen)
      this.sendPortalRequest();

    // Subscribe to WebSocket open event
    this.config.napWebSocket.addEventListener(NAPWebSocketEvent.Open, {
      handleEvent: (event: CustomEvent) => this.sendPortalRequest(),
    }, { signal: this.webSocketAbortController.signal });

    // Subscribe to WebSocket message events
    this.config.napWebSocket.addEventListener(NAPWebSocketEvent.Message, {
      handleEvent: (event: CustomEvent) => this.onMessage(event),
    }, { signal: this.webSocketAbortController.signal });
  }


  /**
   * Destroys the portal and cleans up event listeners
   */
  public destroy(): void {
    // Remove WebSocket event listeners
    this.webSocketAbortController.abort();

    // Remove portal items
    this.removePortalItems();

    // Remove HTML elements
    this.tbody.remove();
    this.table.remove();
  }


  /**
   * Removes portal item event listeners, elements and clears map
   */
  private removePortalItems(): void {
    // Remove portal item event listeners
    this.portalItemAbortController.abort();
    this.portalItemAbortController = new AbortController();

    // Remove portal item elements
    this.portalItems.forEach(item => item.tr.remove());
    this.portalItems.clear();
  }


  /**
   * Add a new portal item from an API message describing the item
   * @param message the API message describing the portal item
   */
  private addPortalItem(message: APIMessage): void {
    // Prevent creating duplicate portal item
    if (this.portalItems.has(message.mID)) {
      console.error(`Cannot add duplicate portal item ${message.mID}`);
      return;
    }
    try {
      // Create portal item
      const item = createPortalItem(message);
      this.portalItems.set(message.mID, item);
      this.tbody.appendChild(item.tr);

      // Subscribe to portal item update events
      item.addEventListener(NAPPortalItemEvent.Update, {
        handleEvent: (event: CustomEvent) => this.onPortalItemUpdate(event),
      }, { signal: this.portalItemAbortController.signal });
    }
    catch(e: any) {
      const error = e instanceof Error ? e.message : e;
      console.error('Failed to create portal item:', error);
    }
  }


  /**
   * Updates an existing portal item from an API message
   * @param message the API message containing the update
   */
  private updatePortalItem(message: APIMessage): void {
    // Prevent updating unknown portal item
    if (!this.portalItems.has(message.mID)) {
      console.error(`Cannot update unkown portal item ${message.mID}`);
      return;
    }
    try {
      // Update portal item
      this.portalItems.get(message.mID)!.update(message);
    }
    catch(e: any) {
      const error = e instanceof Error ? e.message : e;
      console.error('Failed to update portal item:', error);
    }
  }


  /**
   * Requests a portal component's layout from the NAP application
   */
  private sendPortalRequest(): void {
    this.config.napWebSocket.send({
      eventId: this.uuid,
      portalId: this.config.portalId,
      eventType: PortalEventType.Request,
    });
  }


  /**
   * Sends a portal item update to the NAP application
   * @param info The portal item update info to send
   */
  private sendPortalItemUpdate(info: PortalItemUpdateInfo): void {
    this.config.napWebSocket.send({
      eventId: this.uuid,
      portalId: this.config.portalId,
      eventType: PortalEventType.Update,
    }, [
      getPortalItemUpdate(info),
    ]);
  }


  /**
   * Called when the NAPWebSocket receives a message
   * @param event The received event with the message information
   */
  private onMessage(event: CustomEvent): void {
    const { info, messages } = event.detail as NAPWebSocketMessageDetail;
    if (info.portalId !== this.config.portalId)
      return;

    switch(info.eventType) {

      case PortalEventType.Response:
        // The event ID should match our
        // UUID if we performed the request
        if (info.eventId !== this.uuid)
          break;

        this.removePortalItems();
        for (const message of messages)
          this.addPortalItem(message);
        break;

      case PortalEventType.Update:
        // The event ID matches our UUID
        // if we initiated the update
        if (info.eventId === this.uuid)
          break;

        for (const message of messages)
          this.updatePortalItem(message);
        break;

      default:
        console.error(`Cannot handle portal event type ${info.eventType}`);
    }
  }


  /**
   * Called when a NAPPortalItem sends an update
   * @param event The received event with the update information
   */
  private onPortalItemUpdate(event: CustomEvent): void {
    const { info } = event.detail as NAPPortalItemUpdateDetail;
    this.sendPortalItemUpdate(info);
  }
}
