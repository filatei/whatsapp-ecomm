"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PrintPage() {
  const [ip, setIp] = useState(["192", "168", "", ""]);
  const [isValid, setIsValid] = useState(false);
  const inputRefs: React.RefObject<HTMLInputElement>[] = [
  useRef<HTMLInputElement>(null),
  useRef<HTMLInputElement>(null),
  useRef<HTMLInputElement>(null),
  useRef<HTMLInputElement>(null),
];
  const router = useRouter();

  // Handle IP input changes
  const handleIpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newIp = [...ip];
    newIp[index] = value;
    setIp(newIp);

    // Auto-focus to the next field
    if (value.length === 3 && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Validate IP format
    const isFullIp = newIp.every((part) => part !== "");
    const isValidIp = newIp.every((part) => {
      const num = Number(part);
      return num >= 0 && num <= 255;
    });

    setIsValid(isFullIp && isValidIp);
  };

  // Send print job to printer
  const printReceipt = async () => {
  const printerIp = ip.join(".");
  const text = "Order #123\n2x Burger - $10\n1x Coke - $2\n\nThank you!";

  try {
    const res = await fetch("/api/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: printerIp, text }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success("Print Successful", { description: data.message });
    } else {
      toast.error("Print Failed", { description: data.error });
    }
  } catch (error) {
    toast.error("Error", { description: "Failed to send print request." });
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Toaster position="top-center" richColors />
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Print Receipt</h2>

        <label className="block text-gray-700 text-sm font-medium mb-2">Printer IP Address:</label>
        <div className="flex space-x-2">
          {ip.map((part, index) => (
            <Input
              key={index}
              ref={inputRefs[index]}
              type="text"
              value={part}
              onChange={(e) => handleIpChange(index, e.target.value)}
              maxLength={3}
              placeholder="0-255"
              className="w-16 text-center"
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Enter each octet separately.</p>

        <Button
          onClick={printReceipt}
          disabled={!isValid}
          className="mt-4 w-full"
        >
          Print Receipt
        </Button>

        <Button
          onClick={() => router.push("/")}
          variant="secondary"
          className="mt-2 w-full"
        >
          Close & Return Home
        </Button>
      </div>
    </div>
  );
}