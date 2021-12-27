// Local Includes
import { getPortalItemUpdate } from './utils';
import { NAPPortalItem } from './napportalitem';
import {
  APIMessage,
  EventType,
  PortalItemUpdateInfo,
} from './types';
import {
  NAPWebSocket,
  NAPWebSocketEvent,
  NAPWebSocketMessageDetail,
} from './napwebsocket';

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
  private readonly portalItemAbortController: AbortController;  ///< Signals the NAPPortalItem event targets to remove listeners
  private readonly webSocketAbortController: AbortController;   ///< Signals the NAPWebSocket event target to remove listeners
  private readonly table: HTMLElement;                          ///< The table which is added to the element provided in config
  private readonly tbody: HTMLElement;                          ///< The table body which contains our portal item rows

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

    // Subscribe to open event
    this.config.napWebSocket.addEventListener(NAPWebSocketEvent.Open, {
      handleEvent: (event: CustomEvent) => this.sendPortalRequest(),
    }, { signal: this.webSocketAbortController.signal });

    // Subscribe to message events
    this.config.napWebSocket.addEventListener(NAPWebSocketEvent.Message, {
      handleEvent: (event: CustomEvent) => this.onMessage(event),
    }, { signal: this.webSocketAbortController.signal });
  }

  /**
   * Destroys the portal and cleans up event listeners
   */
  public destroy(): void {
    this.webSocketAbortController.abort();
    this.removePortalItems();
    this.tbody.remove();
    this.table.remove();
  }

  /**
   * Removes portal item event listeners, elements and clears map
   */
  private removePortalItems(): void {
    this.portalItemAbortController.abort();
    this.portalItems.forEach(item => item.tr.remove());
    this.portalItems.clear();
  }

  /**
   * Add a new portal item from an API message describing the item
   * @param message the API message describing the portal item
   */
  private addPortalItem(message: APIMessage): void {
    if (this.portalItems.has(message.mID)) {
      console.error(`Cannot add duplicate portal item ${message.mID}`);
      return;
    }
  }

  /**
   * Requests a portal component's layout from the NAP application
   */
  private sendPortalRequest(): void {
    this.config.napWebSocket.send({
      eventId: this.uuid,
      portalId: this.config.portalId,
      eventType: EventType.Request,
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
      eventType: EventType.Update,
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

      case EventType.Response:
        // The event ID should match our
        // UUID if we performed the request
        if (info.eventId !== this.uuid)
          break;

        this.removePortalItems();
        for (const message of messages)
          this.addPortalItem(message);
        break;

      case EventType.Update:
        break;

      default:
        console.error(`Cannot handle portal event type ${info.eventType}`);
    }
  }
}
