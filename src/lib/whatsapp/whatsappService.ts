import { connectToDatabase } from '@/lib/db/mongodb';
import Product from '@/models/Product';
import { getServer } from '@/lib/socket/server';
import type { Product as ProductType } from '@/types/product';
import axios from 'axios';

interface WhatsAppComponent {
    type: string;
    parameters: {
        type: string;
        text: string;
    }[];
}

interface WhatsAppMessage {
    messaging_product: string;
    to: string;
    type: string;
    text?: {
        body: string;
    };
    template?: {
        name: string;
        language: {
            code: string;
        };
        components: WhatsAppComponent[];
    };
}

export class WhatsAppService {
    private static instance: WhatsAppService;
    private io = getServer();
    private accessToken: string;
    private phoneNumberId: string;
    private apiVersion: string;

    private constructor() {
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
        this.apiVersion = 'v17.0';
    }

    static getInstance(): WhatsAppService {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }

    async handleIncomingMessage(message: string) {
        try {
            await connectToDatabase();

            // Check if the message is a product inquiry
            if (message.toLowerCase().includes('products') || message.toLowerCase().includes('menu')) {
                const products = await Product.find({ isAvailable: true });
                return this.formatProductList(products);
            }

            // Check if the message is a specific product inquiry
            const productMatch = message.match(/product\s+(\d+)/i);
            if (productMatch) {
                const productId = productMatch[1];
                const product = await Product.findById(productId);
                if (product) {
                    return this.formatProductDetails(product);
                }
                return 'Sorry, I could not find that product.';
            }

            // Default response
            return `Hello! I'm your WhatsApp order management assistant. You can:
1. Type "products" or "menu" to see our available products
2. Type "product [number]" to get details about a specific product
3. Type "order" to start placing an order`;
        } catch (error) {
            console.error('Error handling WhatsApp message:', error);
            return 'Sorry, I encountered an error. Please try again later.';
        }
    }

    private formatProductList(products: ProductType[]): string {
        if (products.length === 0) {
            return 'Sorry, we currently have no products available.';
        }

        let message = 'Here are our available products:\n\n';
        products.forEach((product, index) => {
            message += `${index + 1}. ${product.name} - ${product.price}\n`;
            message += `   ${product.description}\n\n`;
        });
        message += 'To order, type "product [number]" followed by your order details.';
        return message;
    }

    private formatProductDetails(product: ProductType): string {
        return `Product Details:
Name: ${product.name}
Description: ${product.description}
Price: ${product.price}
Stock: ${product.stock}

To order this product, type "order [product number]" followed by your order details.`;
    }

    async sendMessage(phoneNumber: string, message: string) {
        try {
            const whatsappMessage: WhatsAppMessage = {
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'text',
                text: {
                    body: message,
                },
            };

            const response = await axios.post(
                `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
                whatsappMessage,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('WhatsApp message sent:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            throw error;
        }
    }
} 