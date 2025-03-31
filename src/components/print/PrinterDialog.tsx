'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import ThermalPrinter from '@/plugins/ThermalPrinter';

export default function PrinterDialog() {
  const [printerIp, setPrinterIp] = useState<string>("192.168.1.100");
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      console.log('Starting print process...');

      // Format receipt data
      const receiptData = {
        orderId: "TEST-" + Date.now(),
        items: [
          {
            name: "Test Item 1",
            qty: 2,
            price: 10.99,
          },
          {
            name: "Test Item 2",
            qty: 1,
            price: 15.99,
          },
        ],
        total: 37.97,
      };

      // Convert receipt data to ESC/POS commands
      const escposData = [
        '\x1B\x40', // Initialize printer
        '\x1B\x61\x01', // Center alignment
        'ORDER RECEIPT\n\n',
        '\x1B\x61\x00', // Left alignment
        `Order ID: ${receiptData.orderId}\n`,
        '------------------------\n',
        ...receiptData.items.map(item => 
          `${item.name}\n${item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}\n`
        ),
        '------------------------\n',
        '\x1B\x61\x02', // Right alignment
        `TOTAL: ${receiptData.total.toFixed(2)}\n`,
        '\x1B\x61\x01', // Center alignment
        '\nThank you for your order!\n\n\n',
        '\x1D\x56\x41\x00', // Cut paper
      ].join('');

      console.log('Sending print data to printer...');
      const result = await ThermalPrinter.print({
        ip: printerIp,
        data: escposData
      });

      if (!result.success) {
        throw new Error(result.error || 'Print failed');
      }

      console.log('Print completed successfully');
      toast.success('Receipt printed successfully');
    } catch (error) {
      console.error('Error in print process:', error);
      toast.error('Failed to print receipt: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDiscover = async () => {
    try {
      console.log('Discovering printers...');
      const result = await ThermalPrinter.discover();
      
      if (result.printers.length > 0) {
        setPrinterIp(result.printers[0].ip);
        toast.success(`Found ${result.printers.length} printer(s)`);
      } else {
        toast.warning('No printers found');
      }
    } catch (error) {
      console.error('Error discovering printers:', error);
      toast.error('Failed to discover printers');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Printer className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Print Test Receipt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Printer IP Address</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter printer IP (e.g., 192.168.1.100)"
                value={printerIp}
                onChange={(e) => setPrinterIp(e.target.value)}
              />
              <Button 
                variant="outline"
                onClick={handleDiscover}
              >
                Discover
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handlePrint}
              disabled={isPrinting}
            >
              {isPrinting ? 'Printing...' : 'Print Receipt'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 