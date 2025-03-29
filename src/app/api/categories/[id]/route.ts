import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Category from '@/models/Category';
import { revalidatePath } from 'next/cache';
import { getServer } from '@/lib/socket/server';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Connect to database
        await connectToDatabase();

        // Delete the category
        await Category.findByIdAndDelete(id);

        // Revalidate the categories page
        revalidatePath('/');

        // Emit socket event for real-time update
        const io = getServer();
        io.emit('category:deleted', { id });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
} 