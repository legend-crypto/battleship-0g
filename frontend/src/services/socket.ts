import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

class SocketService {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (!this.socket) {
      // If no backend URL configured in production, disable autoConnect to avoid console spam
      const shouldAutoConnect = !!import.meta.env.VITE_BACKEND_URL || window.location.hostname === 'localhost';

      this.socket = io(BACKEND_URL || 'http://localhost:4000', {
        transports: ['websocket', 'polling'],
        autoConnect: shouldAutoConnect,
        reconnectionAttempts: 3,
        timeout: 5000
      });

      // Silently catch connection errors so the console isn't flooded when backend is offline
      this.socket.on('connect_error', (err) => {
        // Suppress unhandled WebSocket error spam
      });
    } else if (!this.socket.connected && import.meta.env.VITE_BACKEND_URL) {
      this.socket.connect();
    }
    return this.socket;
  }

  public getSocket(): Socket {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
