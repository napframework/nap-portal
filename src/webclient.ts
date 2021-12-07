// External Includes
import { v4 as uuidv4 } from 'uuid';


/**
 * NAPWebClientConfig
 * The config that is passed to the NAPWebClient constructor
 */
export interface NAPWebClientConfig {
  el: Element;      // The DOM element into which the interface will be injected
  host: string;     // The host IP address of the NAP application
  port: number;     // The port on which the NAP application server is hosted
  user: string;     // The username for generating the authentication ticket
  pass: string;     // The password for generating the authentication ticket
  secure: boolean;  // Specify whether to use a secure connection (https / wss)
}

/**
 * NAPWebClient
 * Creates a control interface for a single NAP application
 */
export class NAPWebClient {

  private webSocket: WebSocket | null = null;
  private id: string = uuidv4();
  private config: NAPWebClientConfig;

  constructor(config: NAPWebClientConfig) {
    this.config = config;
  }

  private get wsProtocol(): string {
    return this.config.secure ? 'wss' : 'ws';
  }

  private get wsEndpoint(): string {
    return `${this.wsProtocol}://${this.config.host}:${this.config.port}`;
  }

  private get httpProtocol(): string {
    return this.config.secure ? 'https' : 'http';
  }

  private get httpEndpoint(): string {
    return `${this.httpProtocol}://${this.config.host}:${this.config.port}`;
  }

  /**
   * Start the WebSocket connection
   * Errors need to be caught using a catch block / handler
   * @return A promise that resolves after the WebSocket connection has been started
   */
  public async start(): Promise<void> {

    // Throw an error when the NAPWebClient already started
    if (this.webSocket !== null) {
      throw new Error('NAPWebClient already started');
    }

    // Get the ticket for authenticating the WebSocket connection
    const ticket = await this.getTicket();

    // Open the WebSocket connection and bind event handlers
    this.webSocket = new WebSocket(this.wsEndpoint, ticket);
  }

  /**
   * Stop the WebSocket connection if started
   */
  public stop(): void {

    // Log an error when the NAPWebClient isn't started
    if (this.webSocket === null) {
      return console.error('NAPWebClient not started');
    }

    // Close the WebSocket connection
    this.webSocket.close();
    this.webSocket = null;
  }

  /**
   * Retrieve the authentication ticket for the WebSocket connection
   * @returns A promise that resolves with the ticket after it has been retrieved
   */
  private async getTicket(): Promise<string> {
    const requestInit: RequestInit = {
      method: 'post',
      body: JSON.stringify({
        user: this.config.user,
        pass: this.config.pass,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response: Response = await fetch(this.httpEndpoint, requestInit);
    if (!response.ok) {
      const error = `${response.url} ${response.status} (${response.statusText})`;
      throw new Error(`NAPWebClient failed to get connection ticket: ${error}`);
    }
    const ticket: string = await response.text();
    return ticket;
  }

  /**
   * Called when the NAPWebSocket receives a message
   * @param event The received MessageEvent
   */
  private onMessage(event: MessageEvent): void {
  }
}
