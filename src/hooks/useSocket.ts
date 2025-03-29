'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!socketRef.current) {
            console.log('Initializing Socket.IO connection...');
            socketRef.current = io({
                path: '/api/socketio',
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket.IO connection error:', error);
            });

            socketRef.current.on('connect', () => {
                console.log('Socket.IO connected successfully');
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('Socket.IO disconnected:', reason);
            });
        }

        return () => {
            if (socketRef.current) {
                console.log('Cleaning up Socket.IO connection...');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return socketRef.current;
} 