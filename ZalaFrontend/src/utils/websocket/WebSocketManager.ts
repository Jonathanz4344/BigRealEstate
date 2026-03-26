/**
 * WebSocket Manager - Reusable WebSocket utility for real-time communication
 * Can be used for notifications, live updates, etc.
 */

export type WebSocketEventType =
  | "notification"
  | "team_update"
  | "team_updated"
  | "team_property_linked"
  | "team_property_unlinked"
  | "team_board_linked"
  | "team_board_unlinked"
  | "invitation_update"
  | "member_joined"
  | "member_removed"
  | "member_left"
  | "team_deleted"
  | "team_joined"
  | "member_kicked"
  | "message"
  | "connection";

export type WebSocketMessage<T = unknown> = {
  type: WebSocketEventType;
  data: T;
  timestamp?: string;
};

export type WebSocketListener<T = unknown> = (
  message: WebSocketMessage<T>,
) => void;

class WebSocketManager {
  private socket: WebSocket | null = null;
  private listeners: Map<WebSocketEventType, Set<WebSocketListener>> =
    new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private url: string = "";
  private isManualClose = false;

  /**
   * Connect to WebSocket server
   * @param url - WebSocket URL (e.g., ws://localhost:8000/ws/notifications/123)
   */
  connect(url: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.url = url;
    this.isManualClose = false;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.emit("connection", { status: "connected" });
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Emit to listeners for this specific type
          this.emit(message.type, message.data);
          // Also emit to catch-all "message" listeners
          if (message.type !== "message") {
            this.emit("message" as WebSocketEventType, message);
          }
        } catch (error) {
          // console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      this.socket.onclose = (_event) => {
        this.emit("connection", { status: "disconnected" });

        if (
          !this.isManualClose &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectAttempts++;

          setTimeout(() => this.connect(this.url), this.reconnectDelay);
        }
      };

      this.socket.onerror = (error) => {
        // console.error("[WebSocket] Error:", error);
        this.emit("connection", { status: "error", error });
      };
    } catch (error) {
      // console.error("[WebSocket] Failed to connect:", error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isManualClose = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Send a message through WebSocket
   */
  send<T>(type: WebSocketEventType, data: T): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      // console.warn("[WebSocket] Cannot send - not connected");
      return;
    }

    const message: WebSocketMessage<T> = {
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Subscribe to a specific event type
   */
  on<T>(type: WebSocketEventType, listener: WebSocketListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener as WebSocketListener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(listener as WebSocketListener);
    };
  }

  /**
   * Remove a listener for a specific event type
   */
  off<T>(type: WebSocketEventType, listener: WebSocketListener<T>): void {
    this.listeners.get(type)?.delete(listener as WebSocketListener);
  }

  /**
   * Emit an event to all listeners
   */
  private emit<T>(type: WebSocketEventType, data: T): void {
    const listeners = this.listeners.get(type);

    //   `[WebSocket] Emitting ${type}, listeners found:`,
    //   listeners?.size ?? 0,
    // );
    if (listeners) {
      listeners.forEach((listener) => {
        listener({ type, data } as WebSocketMessage);
      });
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance for global use
export const wsManager = new WebSocketManager();

// Export class for creating additional instances if needed
export { WebSocketManager };
