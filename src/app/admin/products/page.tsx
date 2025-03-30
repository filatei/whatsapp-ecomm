'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ProductTable from '@/components/admin/products/ProductTable';
import { Suspense } from 'react';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Suspense fallback={<div>Loading products...</div>}>
        <ProductTable />
      </Suspense>
    </div>
  );
} 