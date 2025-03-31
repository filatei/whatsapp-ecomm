import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface PrinterWebSocketProps {
    onMessage: (message: any) => void;
}

export default function PrinterWebSocket({ onMessage }: PrinterWebSocketProps) {
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to WebSocket server
        ws.current = new WebSocket(`ws://${window.location.hostname}:3001`);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            toast.error('Failed to connect to printer service');
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [onMessage]);

    const sendToPrinter = async (printerData: any) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(printerData));
        } else {
            toast.error('Printer service not connected');
        }
    };

    return null; // This component doesn't render anything
} 