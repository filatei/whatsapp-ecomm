import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import OTP from '@/models/OTP';

// List of admin phone numbers (you should move this to your database)
const ADMIN_PHONE_NUMBERS = [
    '+2347067647124', // Your number
];

export async function POST(request: Request) {
    try {
        const { phoneNumber, otp } = await request.json();

        if (!phoneNumber || !otp) {
            return NextResponse.json(
                { error: 'Phone number and OTP are required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Check if the phone number is in the admin list
        if (!ADMIN_PHONE_NUMBERS.includes(phoneNumber)) {
            return NextResponse.json(
                { error: 'Unauthorized phone number' },
                { status: 403 }
            );
        }

        // Find and verify OTP
        const otpDoc = await OTP.findOne({
            phoneNumber,
            otp,
        });

        if (!otpDoc) {
            return NextResponse.json(
                { error: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Delete the used OTP
        await OTP.deleteOne({ _id: otpDoc._id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json(
            { error: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
} 