import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { connectToDatabase } from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        // Connect to database
        await connectToDatabase();

        // Fetch all products
        const products = await Product.find({ isAvailable: true }).sort({ createdAt: -1 });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
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
        if (!name || !description || !price || !stock || !category || images.length === 0) {
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

        // Save images and get their URLs
        const imageUrls = await Promise.all(
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

        // Connect to database
        await connectToDatabase();

        // Create product
        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            isAvailable,
            images: imageUrls,
        });

        // Revalidate the products page
        revalidatePath('/');

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDatabase();
        const data = await request.json();
        const { id, ...updateData } = data;

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
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

export async function DELETE(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const product = await Product.findByIdAndUpdate(
            id,
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