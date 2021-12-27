// Local Includes
import { getPortalItemUpdate } from './utils';
import { NAPPortalItem } from './napportalitem';
import {
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
  }

  private removePortalItems() {
    this.portalItemAbortController.abort();
    this.portalItems.forEach(item => item.tr.remove());
    this.portalItems.clear();
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
   * @param event The received MessageEvent
   */
  private onMessage(event: CustomEvent): void {
    const { info, messages } = event.detail as NAPWebSocketMessageDetail;
    if (info.portalId !== this.config.portalId)
      return;

    switch(info.eventType) {

      case EventType.Response:
        break;

      case EventType.Update:
        break;

      default:
        console.error(`Cannot handle portal event type ${info.eventType}`);
    }
  }
}
