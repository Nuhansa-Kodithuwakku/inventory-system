import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { createProduct } from "@/actions/product-actions";
import { connection } from "next/server";

// This is a Server Component.
// It retrieves categories and suppliers from PostgreSQL.
async function NewProductForm() {
  // Wait for an actual request before querying PostgreSQL.
  await connection();

  const [categories, suppliers] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Reusable Tailwind CSS classes for input fields.
  const inputClass =
    "w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const labelClass = "block mb-2 font-medium text-gray-700";

  return (
    <form
      action={createProduct}
      className="bg-white rounded-xl shadow p-6 space-y-5"
    >
      {/* Product Name */}
      <div>
        <label htmlFor="name" className={labelClass}>
          Product Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          className={inputClass}
          placeholder="Wireless Keyboard"
        />
      </div>

      {/* SKU */}
      <div>
        <label htmlFor="sku" className={labelClass}>
          SKU (Stock Keeping Unit)
        </label>

        <input
          id="sku"
          name="sku"
          type="text"
          required
          className={inputClass}
          placeholder="ELEC-002"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          className={inputClass}
          placeholder="Enter product description"
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className={labelClass}>
          Price (LKR)
        </label>

        <input
          id="price"
          name="price"
          type="number"
          min="0.01"
          max="99999999.99"
          step="0.01"
          required
          className={inputClass}
          placeholder="4500.00"
        />
      </div>

      {/* Initial Quantity */}
      <div>
        <label htmlFor="quantity" className={labelClass}>
          Initial Quantity
        </label>

        <input
          id="quantity"
          name="quantity"
          type="number"
          min="0"
          step="1"
          required
          defaultValue={0}
          className={inputClass}
        />
      </div>

      {/* Minimum Stock */}
      <div>
        <label htmlFor="minimumStock" className={labelClass}>
          Minimum Stock Level
        </label>

        <input
          id="minimumStock"
          name="minimumStock"
          type="number"
          min="0"
          step="1"
          required
          defaultValue={5}
          className={inputClass}
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="categoryId" className={labelClass}>
          Category
        </label>

        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Select a category
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {categories.length === 0 && (
          <p className="text-sm text-red-600 mt-2">
            No categories available.{" "}
            <Link href="/categories" className="underline">
              Create a category first.
            </Link>
          </p>
        )}
      </div>

      {/* Supplier */}
      <div>
        <label htmlFor="supplierId" className={labelClass}>
          Supplier (Optional)
        </label>

        <select
          id="supplierId"
          name="supplierId"
          defaultValue=""
          className={inputClass}
        >
          <option value="">No supplier</option>

          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>

        {suppliers.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            No suppliers available.{" "}
            <Link href="/suppliers" className="text-blue-600 underline">
              Add a supplier
            </Link>
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="submit"
          disabled={categories.length === 0}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Product
        </button>

        <Link
          href="/products"
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

// Main Next.js page.
export default function NewProductPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Product</h1>

        <p className="text-gray-500 mt-2">
          Enter product details to add a new item to your inventory.
        </p>
      </div>

      {/* Suspense handles asynchronous data loading */}
      <Suspense
        fallback={
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-gray-500">Loading product form...</p>
          </div>
        }
      >
        <NewProductForm />
      </Suspense>
    </div>
  );
}
