export interface Product {
    _id?: string;
    id?: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    isAvailable: boolean;
    images: string[];
    createdAt: string;
    updatedAt: string;
} 