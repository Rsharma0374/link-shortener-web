import { io, Socket } from 'socket.io-client';
import { ShortenedUrl } from '../types';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToUrlUpdates(callback: (url: ShortenedUrl) => void) {
    if (!this.socket) return;

    this.socket.on('urlUpdate', callback);

    return () => {
      if (this.socket) {
        this.socket.off('urlUpdate', callback);
      }
    };
  }
}

export const socketService = new SocketService(); 