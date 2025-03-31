const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: 3001 });

async function isPrinterAvailable(ip) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);

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

async function scanPrinters() {
    const printers = [];
    const ipBase = '192.168.1'; // Default network

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

    return printers;
}

async function printReceipt(printerData) {
    const { ip, orderId, items, total } = printerData;

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

    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        socket.connect(9100, ip, () => {
            socket.write(receipt, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
        socket.on('error', reject);
    });
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'scan':
                    const printers = await scanPrinters();
                    ws.send(JSON.stringify({ type: 'printers', printers }));
                    break;

                case 'print':
                    await printReceipt(data.data);
                    ws.send(JSON.stringify({ type: 'printStatus', success: true }));
                    break;
            }
        } catch (error) {
            console.error('Error:', error);
            ws.send(JSON.stringify({ type: 'printStatus', success: false, error: error.message }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('Printer WebSocket server running on port 3001'); 