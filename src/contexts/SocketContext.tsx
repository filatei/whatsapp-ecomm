'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from '@/hooks/useSocket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log('Socket connected in context');
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      console.log('Socket disconnected in context');
      setIsConnected(false);
    };

    const onError = (error: Error) => {
      console.error('Socket error in context:', error);
      setError(error);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onError);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
} 