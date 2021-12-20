// Local Includes
import { getPortalEventHeader } from "./utils";
import {
  APIMessage,
  PortalEventHeader,
  PortalEventHeaderInfo,
} from "./types";

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
  Message = 'MESSAGE',
};

/**
 * NAPWebSocket is a wrapper around the native WebSocket API.
 * It extends EventTarget, so can be listened to and supports Promises.
 */
export class NAPWebSocket extends EventTarget {

  private webSocket: WebSocket | null = null;   ///< The native WebSocket connection

  /**
   * Opens the WebSocket connection with a NAP application
   * @param url The endpoint to use for the WebSocket connection
   * @param ticket The ticket that is issued by the NAP application (optional)
   * @returns A Promise that resolves with the open Event when the connection is opened
   */
  public open(url: string | URL, ticket: string | undefined): Promise<Event> {

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
      this.webSocket = new WebSocket(url, ticket);

      // Only ever log errors, no need to be handled specifically
      // When a connection has a failure, close will always be called.
      this.webSocket.onerror = (e: Event) => console.error('NAPWebSocket error:', e);

      // On successfully opening the connection
      this.webSocket.onopen = (e: Event) => {
        this.webSocket!.onopen = null;
        this.webSocket!.onclose = null;
        this.webSocket!.onmessage = (e: MessageEvent) => this.onMessage(e);
        resolve(e);
      };

      // On failing to open the connection
      this.webSocket.onclose = (e: CloseEvent) => {
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
      // Parse JSON and dispatch event
      const detail = JSON.parse(data);
      const event = new CustomEvent(NAPWebSocketEvent.Message, { detail });
      this.dispatchEvent(event);
    } catch(e: any) {
      const error = e instanceof Error ? e.message : e;
      console.error('NAPWebSocket failed to parse message:', error);
    }
  }

  /**
   * Closes the WebSocket connection with a NAP application
   * @returns A Promise that resolves with the CloseEvent when the connection is closed
   */
  public close(): Promise<CloseEvent> {

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

      // Close the WebSocket connection
      this.webSocket.close(1000, "NAPWebSocket::disconnect() was called");

      // On closing the connection
      this.webSocket.onclose = (e: CloseEvent) => {
        this.webSocket!.onerror = null;
        this.webSocket!.onopen = null;
        this.webSocket!.onclose = null;
        this.webSocket!.onmessage = null;
        e.wasClean ? resolve(e) : reject(new Error(`NAPWebSocket didn't close cleanly. Code: ${e.code}. Reason: ${e.reason}.`));
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
    if (this.webSocket === null || this.webSocket.readyState !== NAPWebSocketState.Open)
      throw new Error('NAPWebSocket is not open');

    // Merge event header and portal item messages
    const header: PortalEventHeader = getPortalEventHeader(info);
    const Objects: Array<APIMessage> = [header, ...messages];

    // Send the API messages to the NAP application
    this.webSocket.send(JSON.stringify({ Objects }));
  }
}
