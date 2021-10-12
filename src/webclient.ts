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
  secure?: boolean; // Specify whether to use a secure connection (https / wss)
}

/**
 * NAPWebClient
 * Creates a control interface for a single NAP application
 */
export class NAPWebClient {

  private el: Element;
  private host: string;
  private port: number;
  private user: string;
  private pass: string;
  private secure: boolean;
  private webSocket: WebSocket | null = null;

  constructor(config: NAPWebClientConfig) {
    this.el = config.el;
    this.host = config.host;
    this.port = config.port;
    this.user = config.user;
    this.pass = config.pass;
    this.secure = config.secure ?? false;
  }

  private get wsProtocol(): string {
    return this.secure ? 'wss' : 'ws';
  }

  private get wsEndpoint(): string {
    return `${this.wsProtocol}://${this.host}:${this.port}`;
  }

  private get httpProtocol(): string {
    return this.secure ? 'https' : 'http';
  }

  private get httpEndpoint(): string {
    return `${this.httpProtocol}://${this.host}:${this.port}`;
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
    this.webSocket.onopen = (event: Event) => this.onOpen(event);
    this.webSocket.onclose = (event: CloseEvent) => this.onClose(event);
    this.webSocket.onmessage = (event: MessageEvent) => this.onMessage(event);
    this.webSocket.onerror = (event: Event) => this.onError(event);
  }

  /**
   * Stop the WebSocket connection if started
   */
  public stop(): void {
    if (this.webSocket !== null) {
      this.webSocket.close();
      this.webSocket = null;
    }
  }

  /**
   * Retrieve the authentication ticket for the WebSocket connection
   * @return A promise that resolves with the ticket after it has been retrieved
   */
  private async getTicket(): Promise<string> {
    const requestInit: RequestInit = {
      method: 'post',
      body: JSON.stringify({
        user: this.user,
        pass: this.pass,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response: Response = await fetch(this.httpEndpoint, requestInit);
    const ticket: string = await response.text();
    return ticket;
  }

  /**
   * Called when the WebSocket connection opens
   */
  private onOpen(event: Event): void {
    console.info(`NAPWebClient opened connection with ${this.wsEndpoint}`);
  }

  /**
   * Called when the WebSocket connection closes
   */
  private onClose(event: CloseEvent): void {
    const closeInfo = `Code: ${event.code}. Reason: ${event.reason}.`;
    event.wasClean
      ? console.info(`NAPWebClient cleanly closed connection with ${this.wsEndpoint}: ${closeInfo}`)
      : console.error(`NAPWebClient uncleanly closed connection with ${this.wsEndpoint}: ${closeInfo}`);
  }

  /**
   * Called when the WebSocket receives a message
   */
  private onMessage(event: MessageEvent): void {
    console.info(`NAPWebClient received message from connection with ${this.wsEndpoint}.`, event);
  }

  /**
   * Called when the WebSocket connection receives an error
   */
  private onError(event: Event): void {
    console.error(`NAPWebClient received error from connection with ${this.wsEndpoint}.`, event);
  }
}
