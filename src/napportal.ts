// Local Includes
import {
  PortalEventType,
  PortalItemUpdate,
} from './types';
import {
  NAPWebSocket,
  NAPWebSocketEvent,
} from './napwebsocket';

// External Includes
import { v4 as uuidv4 } from 'uuid';


/**
 * NAPPortalConfig
 * The config that is passed to the NAPPortal constructor
 */
export interface NAPPortalConfig {
  el: Element;                  ///< The DOM element into which the interface will be injected
  napWebSocket: NAPWebSocket;   ///< The NAPWebSocket used for communication with the NAP application
}

/**
 * NAPPortal
 * Creates a control interface for a single NAP application
 */
export class NAPPortal {

  private readonly id: string;                  ///< Unique ID for this NAPPortal instance
  private readonly config: NAPPortalConfig;     ///< The config passed in the NAPPortal constructor

  /**
   * Constructor
   * @param config the configuration for this NAPPortal
   */
  constructor(config: NAPPortalConfig) {
    this.id = uuidv4();
    this.config = config;

    // Request portal if WebSocket is open
    if (this.config.napWebSocket.isOpen)
      this.sendRequest();

    // Subscribe to open event
    this.config.napWebSocket.addEventListener(NAPWebSocketEvent.Open, {
      handleEvent: (event: CustomEvent) => this.sendRequest(),
    });

    // Subscribe to message events
    this.config.napWebSocket.addEventListener(NAPWebSocketEvent.Message, {
      handleEvent: (event: CustomEvent) => this.onMessage(event),
    });
  }

  private sendRequest(): void {
    this.config.napWebSocket.send({
      eventId: this.id,
      portalId: 'PortalComponent',
      eventType: PortalEventType.Request,
    });
  }

  private sendUpdate(update: PortalItemUpdate): void {
    this.config.napWebSocket.send({
      eventId: this.id,
      portalId: 'PortalComponent',
      eventType: PortalEventType.Update,
    }, [update]);
  }

  /**
   * Called when the NAPWebSocket receives a message
   * @param event The received MessageEvent
   */
  private onMessage(event: CustomEvent): void {

  }
}
