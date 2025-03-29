import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';

export async function GET() {
    try {
        await connectToDatabase();

        const [totalProducts, totalOrders, totalCustomers, totalRevenue] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            Order.distinct('customerPhone').then((phones: string[]) => phones.length),
            Order.aggregate([
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]).then((result: { _id: null; total: number }[]) => result[0]?.total || 0)
        ]);

        return NextResponse.json({
            totalProducts,
            totalOrders,
            totalCustomers,
            totalRevenue,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
} 