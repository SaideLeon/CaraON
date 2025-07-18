'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

const getWebSocketURL = () => {
  if (typeof window === 'undefined') {
    return ''; // Return empty string for SSR
  }
  // Connect directly to the secure WebSocket endpoint.
  return 'wss://nest-ended-workforce-tahoe.trycloudflare.com/';
}

interface WebSocketMessage {
  type: 'qr_code' | 'instance_status';
  clientId: string;
  data?: string; // For qr_code
  status?: 'connected' | 'disconnected'; // For instance_status
  message?: string;
}

interface WebSocketContextType {
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const WEBSOCKET_URL = getWebSocketURL();
    if (!WEBSOCKET_URL) return;

    let socket: WebSocket;
    let timeoutId: NodeJS.Timeout;

    const connect = () => {
        socket = new WebSocket(WEBSOCKET_URL);

        socket.onopen = () => {
          console.log('WebSocket connection established.');
          setIsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            setLastMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        socket.onclose = () => {
          console.log('WebSocket connection closed. Attempting to reconnect...');
          setIsConnected(false);
          // Attempt to reconnect after a delay
          timeoutId = setTimeout(connect, 5000);
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          // The 'onclose' event will be fired automatically, which handles the reconnect logic.
        };
    }
    
    connect();

    // Cleanup on component unmount
    return () => {
      clearTimeout(timeoutId);
      if (socket) {
        // Unbind handlers to prevent memory leaks and reconnect attempts on unmount
        socket.onopen = null;
        socket.onmessage = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ lastMessage, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
