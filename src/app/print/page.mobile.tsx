import PrinterDialog from '@/components/print/PrinterDialog'

export default function PrintPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-2xl font-bold mb-8">Print Receipt</h1>
        <PrinterDialog />
      </div>
    </main>
  )
} 