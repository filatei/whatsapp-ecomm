import { NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';

interface ReceiptData {
    orderId: string;
    items: Array<{
        name: string;
        qty: number;
        price: number;
    }>;
    total: number;
}

export async function POST(request: Request) {
    try {
        const data: ReceiptData = await request.json();
        const { orderId, items, total } = data;

        // Create canvas
        const canvas = createCanvas(300, 800);
        const ctx = canvas.getContext('2d');

        // Set white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Set text styles
        ctx.fillStyle = 'black';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';

        // Draw header
        ctx.fillText('ORDER RECEIPT', canvas.width / 2, 40);

        // Draw order ID
        ctx.font = '16px Arial';
        ctx.fillText(`Order ID: ${orderId}`, canvas.width / 2, 70);

        // Draw separator
        ctx.beginPath();
        ctx.moveTo(20, 90);
        ctx.lineTo(canvas.width - 20, 90);
        ctx.stroke();

        // Draw items
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        let y = 120;

        items.forEach(item => {
            // Item name
            ctx.fillText(item.name, 20, y);

            // Quantity and price
            const line = `${item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}`;
            ctx.textAlign = 'right';
            ctx.fillText(line, canvas.width - 20, y);
            ctx.textAlign = 'left';

            y += 30;
        });

        // Draw separator
        ctx.beginPath();
        ctx.moveTo(20, y);
        ctx.lineTo(canvas.width - 20, y);
        ctx.stroke();

        // Draw total
        y += 30;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`TOTAL: ${total.toFixed(2)}`, canvas.width - 20, y);

        // Draw footer
        y += 50;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Thank you for your order!', canvas.width / 2, y);

        // Convert canvas to buffer
        const buffer = canvas.toBuffer('image/png');

        // Return the image as base64
        return NextResponse.json({
            success: true,
            image: buffer.toString('base64')
        });
    } catch (error) {
        console.error('Error generating receipt:', error);
        return NextResponse.json(
            { error: 'Failed to generate receipt' },
            { status: 500 }
        );
    }
} 