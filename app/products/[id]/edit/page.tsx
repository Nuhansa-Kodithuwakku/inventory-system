import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { updateProduct } from "@/actions/product-actions";
import { notFound } from "next/navigation";
import Link from "next/link";

type EditPageProps = {
  params: Promise<{ id: string }>;
};

async function EditProductForm({ params }: EditPageProps) {
  const { id: idString } = await params;

  const id = Number(idString);

  if (!/^[1-9]\d*$/.test(idString) || !Number.isSafeInteger(id)) {
    notFound();
  }

  const [product, categories, suppliers] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 p-3 text-gray-900";

  return (
    <form
      action={updateProduct}
      className="bg-white rounded-xl shadow p-6 space-y-5"
    >
      <input type="hidden" name="id" value={product.id} />

      <div>
        <label className="block mb-2">Product Name</label>
        <input
          name="name"
          defaultValue={product.name}
          minLength={2}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block mb-2">SKU</label>
        <input
          name="sku"
          defaultValue={product.sku}
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className="block mb-2">Description</label>
        <textarea
          name="description"
          defaultValue={product.description ?? ""}
          maxLength={500}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block mb-2">Price</label>
        <input
          name="price"
          type="number"
          min="0.01"
          max="99999999.99"
          step="0.01"
          required
          defaultValue={product.price.toString()}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block mb-2">Minimum Stock</label>
        <input
          name="minimumStock"
          type="number"
          min="0"
          step="1"
          required
          defaultValue={product.minimumStock}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block mb-2">Category</label>
        <select
          name="categoryId"
          defaultValue={product.categoryId}
          required
          className={inputClass}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2">Supplier</label>

        <select
          name="supplierId"
          defaultValue={product.supplierId ?? ""}
          className={inputClass}
        >
          <option value="">No supplier</option>

          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Update Product
        </button>

        <Link href="/products" className="border rounded-lg px-6 py-3">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default function EditProductPage({ params }: EditPageProps) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>

      <Suspense fallback={<p>Loading product...</p>}>
        <EditProductForm params={params} />
      </Suspense>
    </div>
  );
}
