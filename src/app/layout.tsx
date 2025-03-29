import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "WhatsApp Order Management",
  description: "Streamline your business with automated WhatsApp ordering and inventory management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">
        <AdminAuthProvider>
          {children}
          <Toaster />
        </AdminAuthProvider>
      </body>
    </html>
  );
}
