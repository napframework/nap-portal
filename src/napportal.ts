// Local Includes
import { getPortalItemUpdate } from './utils';
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
  el: Element;                  ///< The DOM element into which the interface will be injected
  portalId: string;             ///< The portal ID, should match with a PortalComponent ID in Napkin
  napWebSocket: NAPWebSocket;   ///< The NAPWebSocket used for communication with the NAP application
}

/**
 * NAPPortal
 * Creates a control interface for a single NAP application
 */
export class NAPPortal {

  private readonly uuid: string;                ///< Unique ID for this NAPPortal instance
  private readonly config: NAPPortalConfig;     ///< The config passed in the NAPPortal constructor
  private readonly aborter: AbortController;    ///< Signals the NAPWebSocket event target to remove listeners

  /**
   * Constructor
   * @param config the configuration for this NAPPortal
   */
  constructor(config: NAPPortalConfig) {
    this.uuid = uuidv4();
    this.config = config;
    this.aborter = new AbortController();

    // Request portal if WebSocket is open
    if (this.config.napWebSocket.isOpen)
      this.sendRequest();

    // Subscribe to open event
    this.config.napWebSocket.addEventListener(NAPWebSocketEvent.Open, {
      handleEvent: (event: CustomEvent) => this.sendRequest(),
    }, { signal: this.aborter.signal });

    // Subscribe to message events
    this.config.napWebSocket.addEventListener(NAPWebSocketEvent.Message, {
      handleEvent: (event: CustomEvent) => this.onMessage(event),
    }, { signal: this.aborter.signal });
  }

  /**
   * Destroys the portal and cleans up event listeners
   */
  public destroy(): void {
    this.aborter.abort();
    this.config.el.innerHTML = '';
  }

  /**
   * Requests a portal component's layout from the NAP application
   */
  private sendRequest(): void {
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
  private sendUpdate(info: PortalItemUpdateInfo): void {
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
