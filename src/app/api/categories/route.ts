import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Category from '@/models/Category';
import { revalidatePath } from 'next/cache';
import { getServer } from '@/lib/socket/server';

export async function GET() {
    try {
        await connectToDatabase();
        const categories = await Category.find({}).sort({ name: 1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const category = await Category.create({
            name,
            description,
        });

        // Revalidate the categories page
        revalidatePath('/');

        // Emit socket event for real-time update
        const io = getServer();
        io.emit('category:created', category);

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
} 