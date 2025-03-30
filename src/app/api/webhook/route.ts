import { NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp/whatsappService';

// Create instance without initializing Socket.IO
const whatsappService = WhatsAppService.getInstance();

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('hub.mode');
        const token = searchParams.get('hub.verify_token');
        const challenge = searchParams.get('hub.challenge');

        if (mode && token) {
            if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
                return NextResponse.json({ challenge });
            }
        }

        return NextResponse.json({ error: 'Invalid verification token' }, { status: 403 });
    } catch (error) {
        console.error('Error handling webhook verification:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Handle WhatsApp webhook verification
        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];

            if (message) {
                const from = message.from;
                const text = message.text?.body;

                if (text) {
                    const response = await whatsappService.handleIncomingMessage(text);
                    await whatsappService.sendMessage(from, response);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 