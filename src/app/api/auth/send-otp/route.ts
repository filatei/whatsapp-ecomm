import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { connectToDatabase } from '@/lib/mongodb';
import OTP from '@/models/OTP';

export async function POST(request: Request) {
    try {
        const { phoneNumber } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json(
                { error: 'Phone number is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in database
        await OTP.create({
            phoneNumber,
            otp,
        });

        // Send OTP via WhatsApp
        const message = `Your OTP for admin access is: ${otp}. This code will expire in 5 minutes.`;
        await sendWhatsAppMessage(phoneNumber, message);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json(
            { error: 'Failed to send OTP' },
            { status: 500 }
        );
    }
} 