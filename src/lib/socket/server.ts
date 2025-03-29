import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

let io: SocketIOServer | null = null;

export function getServer() {
    if (!io) {
        throw new Error('Socket.IO server not initialized');
    }
    return io;
}

export function initSocket(server: NetServer) {
    if (io) {
        return io;
    }

    io = new SocketIOServer(server, {
        path: '/api/socketio',
        addTrailingSlash: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

export type NextApiResponseServerIO = NextApiResponse & {
    socket: {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
}; 