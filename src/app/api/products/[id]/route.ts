import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import { getServer } from '@/lib/socket/server';
import { mkdir, writeFile } from 'fs/promises';

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
        // Parse the form data
        const formData = await request.formData();

        // Extract text fields
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = formData.get('price') as string;
        const stock = formData.get('stock') as string;
        const category = formData.get('category') as string;
        const isAvailable = formData.get('isAvailable') === 'true';

        // Get image files
        const images = formData.getAll('images') as File[];

        // Validate required fields
        if (!name || !description || !price || !stock || !category) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            console.error('Error creating upload directory:', error);
            return NextResponse.json(
                { error: 'Failed to create upload directory' },
                { status: 500 }
            );
        }

        // Save new images and get their URLs
        let imageUrls: string[] = [];
        if (images.length > 0) {
            imageUrls = await Promise.all(
                images.map(async (image) => {
                    try {
                        const bytes = await image.arrayBuffer();
                        const buffer = Buffer.from(bytes);
                        const filename = `${Date.now()}-${image.name}`;
                        const path = join(uploadDir, filename);
                        await writeFile(path, buffer);
                        return `/uploads/products/${filename}`;
                    } catch (error) {
                        console.error('Error saving image:', error);
                        throw new Error('Failed to save image');
                    }
                })
            );
        }

        // Connect to database
        await connectToDatabase();

        // Get existing product
        const existingProduct = await Product.findById(params.id);
        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Update product
        const updateData: any = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            isAvailable,
        };

        // Only update images if new ones were uploaded
        if (imageUrls.length > 0) {
            updateData.images = imageUrls;
        }

        const product = await Product.findByIdAndUpdate(
            params.id,
            updateData,
            { new: true }
        );

        // Revalidate the products page
        revalidatePath('/');

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