import { NextRequest, NextResponse } from "next/server";
import escpos from "escpos";
import path from "path";
import { createCanvas, loadImage } from "canvas";
import * as net from 'net';
import { join } from 'path';
import { readFileSync } from 'fs';
import { Socket } from 'net';

escpos.Network = require("escpos-network"); // Required for network printing

// Force dynamic route, no static generation
export const dynamic = 'force-dynamic';

interface PrintRequest {
    ip: string;
    orderId: string;
    items: Array<{
        name: string;
        qty: number;
        price: number;
    }>;
    total: number;
}

export async function POST(request: Request) {
    // During build time, return success without printing
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'build') {
        return NextResponse.json({ success: true });
    }

    try {
        const data: PrintRequest = await request.json();
        const { ip, orderId, items, total } = data;

        // Create receipt content with proper ESC/POS commands
        const receipt = Buffer.from([
            // Initialize printer
            0x1B, 0x40,
            // Set text alignment to center
            0x1B, 0x61, 0x01,
            // Set text size to normal
            0x1B, 0x21, 0x00,
            // Print header
            ...Buffer.from('\n\nORDER RECEIPT\n\n'),
            // Set text alignment to left
            0x1B, 0x61, 0x00,
            // Print order details
            ...Buffer.from(`Order ID: ${orderId}\n`),
            ...Buffer.from('------------------------\n'),
            // Print items
            ...Buffer.from(items.map(item =>
                `${item.name}\n${item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}\n`
            ).join('\n')),
            ...Buffer.from('------------------------\n'),
            // Set text size to double height
            0x1B, 0x21, 0x10,
            // Print total
            ...Buffer.from(`TOTAL: ${total.toFixed(2)}\n`),
            // Set text size back to normal
            0x1B, 0x21, 0x00,
            // Print footer
            ...Buffer.from('\nThank you for your order!\n\n\n'),
            // Cut paper
            0x1D, 0x56, 0x41, 0x00,
            // Feed paper
            0x0A, 0x0A, 0x0A
        ]);

        // Connect to printer
        const socket = new Socket();
        await new Promise<void>((resolve, reject) => {
            socket.connect(9100, ip, () => {
                resolve();
            });
            socket.on('error', (error: Error) => {
                reject(error);
            });
        });

        // Send data to printer
        await new Promise<void>((resolve, reject) => {
            socket.write(receipt, (error?: Error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        // Close connection
        socket.end();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error printing:', error);
        return NextResponse.json(
            { error: 'Failed to print' },
            { status: 500 }
        );
    }
}