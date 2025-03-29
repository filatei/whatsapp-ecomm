'use client';

import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';
import { Product } from '@/types/product';

export function useProductUpdates() {
    const [products, setProducts] = useState<Product[]>([]);
    const socket = useSocket();

    useEffect(() => {
        // Initial fetch
        fetch('/api/products')
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch((error) => console.error('Error fetching products:', error));

        if (!socket) return;

        // Listen for real-time updates
        socket.on('product:created', (product: Product) => {
            setProducts((prev) => [product, ...prev]);
        });

        socket.on('product:updated', (product: Product) => {
            setProducts((prev) =>
                prev.map((p) => (p.id === product.id ? product : p))
            );
        });

        socket.on('product:deleted', ({ id }: { id: string }) => {
            setProducts((prev) => prev.filter((p) => p.id !== id));
        });

        return () => {
            socket.off('product:created');
            socket.off('product:updated');
            socket.off('product:deleted');
        };
    }, [socket]);

    return products;
} 