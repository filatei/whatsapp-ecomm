import { NextResponse } from 'next/server';
import * as net from 'net';

// Force dynamic route, no static generation
export const dynamic = 'force-dynamic';

async function isPrinterAvailable(ip: string): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000); // 1 second timeout

        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });

        socket.connect(9100, ip);
    });
}

export async function GET() {
    // During build time, return default printer only
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'build') {
        return NextResponse.json({
            printers: [{ ip: '192.168.1.100', name: 'Default Printer' }]
        });
    }

    try {
        // Default printer IP
        const defaultPrinter = { ip: '192.168.1.100', name: 'Default Printer' };

        // Check if default printer is available
        const isDefaultAvailable = await isPrinterAvailable(defaultPrinter.ip);

        // If default printer is available, return only that
        if (isDefaultAvailable) {
            return NextResponse.json({ printers: [defaultPrinter] });
        }

        // If default printer is not available, scan network
        const printers = [];
        const ipBase = '192.168.1'; // Default network

        // Scan for printers on port 9100
        for (let i = 1; i <= 254; i++) {
            const ip = `${ipBase}.${i}`;
            const isAvailable = await isPrinterAvailable(ip);

            if (isAvailable) {
                printers.push({
                    ip,
                    name: `Printer ${i}`
                });
            }
        }

        // If no printers found, return default printer anyway
        if (printers.length === 0) {
            return NextResponse.json({ printers: [defaultPrinter] });
        }

        return NextResponse.json({ printers });
    } catch (error) {
        console.error('Error scanning printers:', error);
        // Return default printer in case of error
        return NextResponse.json({
            printers: [{ ip: '192.168.1.100', name: 'Default Printer' }]
        });
    }
} 