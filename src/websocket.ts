/**
 * Possible readyState values of the WebSocket connection
 */
 export enum NAPWebSocketState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
}

/**
 * Events emitted by NAPWebSocket
 */
 export enum NAPWebSocketEvent {
  Message = 'MESSAGE',
}

/**
 * NAPWebSocket is a wrapper around the native WebSocket API.
 * It extends EventTarget, so can be listened to and supports Promises.
 */
export class NAPWebSocket extends EventTarget {

  // WebSocket connection
  private webSocket: WebSocket | null = null;

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
        this.webSocket!.onmessage = (e: MessageEvent) =>
          this.dispatchEvent(new CustomEvent(NAPWebSocketEvent.Message, e));
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
}
