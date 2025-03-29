import { NextResponse } from 'next/server';
import { createServer } from 'http';
import { initSocket } from '@/lib/socket/server';

const server = createServer();
const io = initSocket(server);

export async function GET() {
    return NextResponse.json({ message: 'Socket.IO server is running' });
}

export async function POST() {
    return NextResponse.json({ message: 'Socket.IO server is running' });
} 