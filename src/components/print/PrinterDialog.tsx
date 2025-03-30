'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Printer {
  ip: string;
  name: string;
}

export default function PrinterDialog() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("192.168.1.100");
  const [customIp, setCustomIp] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    scanPrinters();
  }, []);

  const scanPrinters = async () => {
    try {
      setIsScanning(true);
      const response = await fetch("/api/print/scan");
      if (!response.ok) throw new Error("Failed to scan printers");
      const data = await response.json();
      setPrinters(data.printers);
      
      // Set default printer if available
      if (data.printers.length > 0) {
        setSelectedPrinter(data.printers[0].ip);
      }
    } catch (error) {
      console.error("Error scanning printers:", error);
      toast.error("Failed to scan printers");
    } finally {
      setIsScanning(false);
    }
  };

  const handlePrint = async () => {
    try {
      const response = await fetch("/api/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ip: customIp || selectedPrinter,
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
        }),
      });

      if (!response.ok) throw new Error("Failed to print");
      toast.success("Test receipt printed successfully");
    } catch (error) {
      console.error("Error printing:", error);
      toast.error("Failed to print receipt");
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
            <label className="text-sm font-medium">Select Printer</label>
            <Select
              value={selectedPrinter}
              onValueChange={setSelectedPrinter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a printer" />
              </SelectTrigger>
              <SelectContent>
                {printers.map((printer) => (
                  <SelectItem key={printer.ip} value={printer.ip}>
                    {printer.name} ({printer.ip})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Or Enter Custom IP</label>
            <Input
              placeholder="Enter printer IP (e.g., 192.168.1.100)"
              value={customIp}
              onChange={(e) => setCustomIp(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={scanPrinters}
              disabled={isScanning}
            >
              {isScanning ? "Scanning..." : "Scan Network"}
            </Button>
            <Button onClick={handlePrint}>
              Print Test Receipt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 