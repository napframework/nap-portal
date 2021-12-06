/**
 * Possible readyState values of the WebSocket connection
 */
enum WebSocketState {
  Connecting = 0,
  Open = 1,
  Closing = 2,
  Closed = 3,
}

/**
 * NAPWebSocket is a wrapper around the native WebSocket API.
 * It extends EventTarget, so can be listened to and supports Promises.
 */
export class NAPWebSocket extends EventTarget {

  // WebSocket connection
  private webSocket: WebSocket | null = null;

  /**
   * Establishes the WebSocket connection with a NAP application
   * @param url The endpoint to use for the WebSocket connection
   * @param ticket The ticket that is issued by the NAP application (optional)
   * @returns A Promise that resolves with the open event when the connection is established
   */
  public connect(url: string | URL, ticket: string | undefined): Promise<Event> {

    return new Promise((resolve, reject) => {

      // Reject when the connection is not closed
      if (this.webSocket) {
        switch(this.webSocket.readyState) {
          case WebSocketState.Connecting:
            return reject(new Error('NAPWebSocket is already connecting'));
          case WebSocketState.Open:
            return reject(new Error('NAPWebSocket is already connected'));
          case WebSocketState.Closing:
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
        this.webSocket!.onmessage = (e: MessageEvent) => this.dispatchEvent(new CustomEvent("message", e));
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
   * Terminates the WebSocket connection with a NAP application
   * @returns A Promise that resolves with the close event when the connection is terminated
   */
  disconnect(): Promise<CloseEvent> {

    return new Promise((resolve, reject) => {

      // Reject when the connection was never made
      if (!this.webSocket)
        return reject(new Error('NAPWebSocket was never connected'));

      // Reject when the connection is not open
      switch(this.webSocket.readyState) {
        case WebSocketState.Connecting:
          return reject(new Error('NAPWebSocket is still connecting'));
        case WebSocketState.Closing:
          return reject(new Error('NAPWebSocket is already closing'));
        case WebSocketState.Closed:
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
