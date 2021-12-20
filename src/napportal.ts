// Local Includes
import { getTicket } from './utils';
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
  el: Element;      // The DOM element into which the interface will be injected
  host: string;     // The host IP address of the NAP application
  port: number;     // The port on which the NAP application server is hosted
  user: string;     // The username for generating the authentication ticket
  pass: string;     // The password for generating the authentication ticket
  secure: boolean;  // Specify whether to use a secure connection (https / wss)
}

/**
 * NAPPortal
 * Creates a control interface for a single NAP application
 */
export class NAPPortal {

  private readonly id: string;                  ///< Unique ID for this NAPPortal instance
  private readonly config: NAPPortalConfig;     ///< The config passed in the NAPPortal constructor
  private readonly webSocket: NAPWebSocket;     ///< The NAPWebSocket that communicates with the NAP application

  /**
   * Constructor
   * @param config the configuration for this NAPPortal
   */
  constructor(config: NAPPortalConfig) {
    this.id = uuidv4();
    this.config = config;
    this.webSocket = new NAPWebSocket();
    this.webSocket.addEventListener(NAPWebSocketEvent.Message, {
      handleEvent: (event: CustomEvent) => this.onMessage(event)
    });
  }

  /**
   * The WebSocket protocol, wss or ws
   */
  private get wsProtocol(): string {
    return this.config.secure ? 'wss' : 'ws';
  }

  /**
   * The WebSocket endpoint
   */
  private get wsEndpoint(): string {
    return `${this.wsProtocol}://${this.config.host}:${this.config.port}`;
  }

  /**
   * The HTTP protocol, https or http
   */
  private get httpProtocol(): string {
    return this.config.secure ? 'https' : 'http';
  }

  /**
   * The HTTP endpoint
   */
  private get httpEndpoint(): string {
    return `${this.httpProtocol}://${this.config.host}:${this.config.port}`;
  }

  /**
   * Starts communication with the NAP application and rendering the UI
   * @returns A promise that resolves when the NAPPortal has started
   */
  public async start(): Promise<void> {

    // Get the ticket for authenticating the WebSocket connection
    const { user, pass } = this.config;
    const ticket = await getTicket(user, pass, this.httpEndpoint);

    // Open the WebSocket connection
    await this.webSocket.open(this.wsEndpoint, ticket);
  }

  /**
   * Stops communication with the NAP application and clears the UI
   * @returns A promise that resolves when the NAPPortal has stopped
   */
  public async stop(): Promise<void> {

    // Close the WebSocket connection
    await this.webSocket.close();
  }

  public sendRequest(): void {
    this.webSocket.send({
      eventId: this.id,
      portalId: 'PortalComponent',
      eventType: PortalEventType.Request,
    });
  }

  public sendUpdate(update: PortalItemUpdate): void {
    this.webSocket.send({
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
