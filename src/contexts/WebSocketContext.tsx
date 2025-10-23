
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';

const getWebSocketURL = () => {
  if (typeof window === 'undefined') {
    return ''; // Return empty string for SSR
  }
  // Connect directly to the secure WebSocket endpoint.
  return 'wss://app.caraon.qzz.io/';
}

export interface WebSocketMessage {
  type: 'qr_code' | 'instance_status';
  clientId?: string; // For instance updates
  data?: any; // For qr_code
  status?: 'connected' | 'disconnected' | 'reconnecting'; // For instance_status
}

interface WebSocketContextType {
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
  sendMessage: (message: object) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
        return;
    }
    
    const WEBSOCKET_URL = getWebSocketURL();
    if (!WEBSOCKET_URL) return;

    socketRef.current = new WebSocket(WEBSOCKET_URL);
    const socket = socketRef.current;

    socket.onopen = () => {
      console.log('WebSocket connection established.');
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
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
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    };

    socket.onerror = () => {
      console.log('A WebSocket error occurred. This is a generic error; see the "onclose" event for more details.');
      socket.close(); 
    };
  }, []);
  
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onmessage = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
      }
    };
  }, [connect]);
  
  const sendMessage = (message: object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  };

  return (
    <WebSocketContext.Provider value={{ lastMessage, isConnected, sendMessage }}>
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
