"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Plus,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Toaster } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PrinterDialog from "@/components/print/PrinterDialog";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { isAdmin } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    // Add text fields
    formData.append(
      "name",
      (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value
    );
    formData.append(
      "description",
      (e.currentTarget.elements.namedItem("description") as HTMLInputElement)
        .value
    );
    formData.append(
      "price",
      (e.currentTarget.elements.namedItem("price") as HTMLInputElement).value
    );
    formData.append(
      "stock",
      (e.currentTarget.elements.namedItem("stock") as HTMLInputElement).value
    );
    formData.append(
      "category",
      (e.currentTarget.elements.namedItem("category") as HTMLInputElement).value
    );
    formData.append("isAvailable", "true");

    // Add image files
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct._id}`
        : '/api/products';
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(editingProduct ? 'Failed to update product' : 'Failed to add product');

      toast.success(editingProduct ? 'Product updated successfully' : 'Product added successfully');
      setIsDialogOpen(false);
      setPreviewUrls([]);
      setSelectedFiles([]);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to add product');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">WhatsApp Order Management</h1>
          <div className="flex items-center gap-2">
            <PrinterDialog />
            {isAdmin && (
              <Button asChild>
                <a href="/admin">Go to Admin Dashboard</a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center gap-4">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Products
                </p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Orders
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Customers
                </p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">{formatCurrency(0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Welcome to WhatsApp Order Management
            </h2>
            <p className="text-gray-600">
              This system allows your customers to place orders directly through
              WhatsApp. They can browse products, place orders, and track their
              order status all through WhatsApp.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Products</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex justify-between items-center">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                    <div className="flex items-center gap-2">
                      <Button type="submit" form="product-form">
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setEditingProduct(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <form id="product-form" onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        required 
                        defaultValue={editingProduct?.name}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        required
                        defaultValue={editingProduct?.price}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input 
                        id="stock" 
                        name="stock" 
                        type="number" 
                        required
                        defaultValue={editingProduct?.stock}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input 
                        id="category" 
                        name="category" 
                        required
                        defaultValue={editingProduct?.category}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      id="description" 
                      name="description" 
                      required
                      defaultValue={editingProduct?.description}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="images">Images</Label>
                    <Input
                      id="images"
                      name="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      required={!editingProduct}
                    />
                    {(previewUrls.length > 0 || (editingProduct?.images && editingProduct.images.length > 0)) && (
                      <div className="mt-4 max-h-[200px] overflow-y-auto border p-2 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {previewUrls.length > 0 ? (
                            previewUrls.map((url, index) => (
                              <div key={index} className="relative w-full aspect-square">
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="rounded-lg object-cover w-full h-full"
                                />
                              </div>
                            ))
                          ) : (
                            editingProduct?.images?.map((url, index) => (
                              <div key={index} className="relative w-full aspect-square">
                                <img
                                  src={url}
                                  alt={`Product ${index + 1}`}
                                  className="rounded-lg object-cover w-full h-full"
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product, index) => (
                  <TableRow key={product._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {product.images?.[0] && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle className="flex justify-between items-center">
                                {product.name}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedImage(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {product.images.map((url, index) => (
                                <div key={index} className="relative aspect-square">
                                  <img
                                    src={url}
                                    alt={`${product.name} - Image ${index + 1}`}
                                    className="rounded-lg object-cover w-full h-full"
                                  />
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{product.description}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => product._id && handleDelete(product._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
