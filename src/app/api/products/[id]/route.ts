import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import { getServer } from '@/lib/socket/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();
        const product = await Product.findById(params.id);
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();
        const data = await request.json();
        const product = await Product.findByIdAndUpdate(
            params.id,
            data,
            { new: true }
        );
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();
        const product = await Product.findByIdAndUpdate(
            params.id,
            { isAvailable: false },
            { new: true }
        );
        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }
        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
} 