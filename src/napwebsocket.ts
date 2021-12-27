// Local Includes
import { testPortalEvent } from "./validation";
import {
  getTicket,
  getPortalEventHeader,
  getPortalEventHeaderInfo,
} from "./utils";
import {
  APIMessage,
  PortalEvent,
  PortalEventHeader,
  PortalEventHeaderInfo,
} from "./types";

/**
 * NAPWebSocketConfig
 * The config that is passed to the NAPWebSocket constructor
 */
export interface NAPWebSocketConfig {
  host: string;     ///< The host IP address of the NAP application
  port: number;     ///< The port on which the NAP application server is hosted
  user: string;     ///< The username for generating the authentication ticket
  pass: string;     ///< The password for generating the authentication ticket
  secure: boolean;  ///< Specify whether to use a secure connection (https / wss)
}

/**
 * Possible readyState values of the WebSocket connection
 */
 export enum NAPWebSocketState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
};

/**
 * Events emitted by NAPWebSocket
 */
 export enum NAPWebSocketEvent {
  Open = 'OPEN',
  Close = 'CLOSE',
  Message = 'MESSAGE',
};

/**
 * Detail sent with NAPWebSocketEvent.Message events
 */
 export interface NAPWebSocketMessageDetail {
  info: PortalEventHeaderInfo;
  messages: Array<APIMessage>;
};

/**
 * NAPWebSocket is a wrapper around the native WebSocket API.
 * It extends EventTarget, so can be listened to and supports Promises.
 */
export class NAPWebSocket extends EventTarget {

  private readonly config: NAPWebSocketConfig;  ///< The config passed in the NAPWebSocket constructor
  private webSocket: WebSocket | null = null;   ///< The native WebSocket connection

  /**
   * Constructor
   * @param config the configuration for this NAPWebSocket
   */
  constructor(config: NAPWebSocketConfig) {
    super();
    this.config = config;
  }

  /**
   * @return whether the WebSocket is open
   */
  public get isOpen(): boolean {
    return this.webSocket !== null && this.webSocket.readyState === NAPWebSocketState.Open;
  }

  /**
   * @return the WebSocket endpoint
   */
  private get wsEndpoint(): string {
    const protocol = this.config.secure ? 'wss' : 'ws';
    return `${protocol}://${this.config.host}:${this.config.port}`;
  }

  /**
   * @return the HTTP endpoint
   */
  private get httpEndpoint(): string {
    const protocol = this.config.secure ? 'https' : 'http';
    return `${protocol}://${this.config.host}:${this.config.port}`;
  }

  /**
   * Opens the WebSocket connection with a NAP application
   * @returns A Promise that resolves when the connection is opened
   */
  public async open(): Promise<void> {

    const { user, pass } = this.config;
    const ticket = await getTicket(user, pass, this.httpEndpoint);

    return new Promise((resolve, reject) => {

      // Reject when the connection is not closed
      if (this.webSocket) {
        switch(this.webSocket.readyState) {
          case NAPWebSocketState.Connecting:
            return reject(new Error('NAPWebSocket is already connecting'));
          case NAPWebSocketState.Open:
            return reject(new Error('NAPWebSocket is already open'));
          case NAPWebSocketState.Closing:
            return reject(new Error('NAPWebSocket is still closing'));
        }
      }

      // Open the WebSocket connection
      this.webSocket = new WebSocket(this.wsEndpoint, ticket);

      // Only ever log errors, no need to be handled specifically
      // When a connection has a failure, close will always be called.
      this.webSocket.onerror = (e: Event) => console.error('NAPWebSocket error:', e);

      // On successfully opening the connection
      this.webSocket.onopen = (e: Event) => {

        // Reset event handlers
        this.webSocket!.onopen = null;
        this.webSocket!.onclose = null;
        this.webSocket!.onmessage = (e: MessageEvent) => this.onMessage(e);

        // Notify listeners that we're open
        this.dispatchEvent(new CustomEvent(NAPWebSocketEvent.Open));

        resolve();
      };

      // On failing to open the connection
      this.webSocket.onclose = (e: CloseEvent) => {

        // Reset event handlers
        this.webSocket!.onopen = null;
        this.webSocket!.onclose = null;
        this.webSocket!.onmessage = null;

        reject(new Error(`NAPWebSocket failed to connect. Code: ${e.code}. Reason: ${e.reason}.`));
      };
    });
  }

  private onMessage(message: MessageEvent): void {

    // Check message data type
    const { data } = message;
    if (typeof data !== 'string') {
      console.error(`NAPWebSocket cannot process message type: ${typeof data}`);
      return;
    }

    try {
      // Parse JSON and validate event
      const json: any = JSON.parse(data);
      const event: PortalEvent = testPortalEvent(json);

      // Extract portal event header info and API messages
      const header = event.splice(0, 1)[0] as PortalEventHeader;
      const info = getPortalEventHeaderInfo(header);
      const messages = event as Array<APIMessage>;

      // Notify listeners of new message
      const detail: NAPWebSocketMessageDetail = { info, messages };
      this.dispatchEvent(new CustomEvent(NAPWebSocketEvent.Message, { detail }));
    }
    catch(e: any) {
      const error = e instanceof Error ? e.message : e;
      console.error('NAPWebSocket failed to parse message:', error);
    }
  }

  /**
   * Closes the WebSocket connection with a NAP application
   * @returns A Promise that resolves when the connection is closed
   */
  public close(): Promise<void> {

    return new Promise((resolve, reject) => {

      // Reject when the connection was never opened
      if (!this.webSocket)
        return reject(new Error('NAPWebSocket was never opened'));

      // Reject when the connection is not open
      switch(this.webSocket.readyState) {
        case NAPWebSocketState.Connecting:
          return reject(new Error('NAPWebSocket is still connecting'));
        case NAPWebSocketState.Closing:
          return reject(new Error('NAPWebSocket is already closing'));
        case NAPWebSocketState.Closed:
          return reject(new Error('NAPWebSocket is already closed'));
      }

      // Notify listeners that we're closing
      this.dispatchEvent(new CustomEvent(NAPWebSocketEvent.Close));

      // Close the WebSocket connection
      this.webSocket.close(1000, "NAPWebSocket::disconnect() was called");

      // On closing the connection
      this.webSocket.onclose = (e: CloseEvent) => {
        this.webSocket!.onerror = null;
        this.webSocket!.onopen = null;
        this.webSocket!.onclose = null;
        this.webSocket!.onmessage = null;
        e.wasClean ? resolve() : reject(new Error(`NAPWebSocket didn't close cleanly. Code: ${e.code}. Reason: ${e.reason}.`));
      };
    });
  }

  /**
   * Sends a portal event to the NAP application
   * @param info The info object used to create the event header
   * @param messages The messages relating to portal items
   */
  public send(info: PortalEventHeaderInfo, messages: Array<APIMessage> = []): void {

    // Throw when the connection is not open
    if (!this.isOpen)
      throw new Error('NAPWebSocket is not open');

    // Merge event header and portal item messages
    const header: PortalEventHeader = getPortalEventHeader(info);
    const Objects: Array<APIMessage> = [header, ...messages];

    // Send the API messages to the NAP application
    this.webSocket!.send(JSON.stringify({ Objects }));
  }
}
