import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import DeleteProductButton from "@/components/DeleteProductButton";

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

async function ProductsContent({ searchParams }: ProductsPageProps) {
  // Get the search query from the URL.
  const params = await searchParams;
  const rawQuery = params.q;

  const query = (Array.isArray(rawQuery) ? rawQuery[0] : (rawQuery ?? ""))
    .trim()
    .slice(0, 100);

  // Search products by name or SKU.
  const products = await prisma.product.findMany({
    where: query
      ? {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              sku: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        }
      : {},

    include: {
      category: true,
      supplier: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Search form */}
      <form action="/products" method="GET" className="flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search by name or SKU..."
          maxLength={100}
          className="flex-1 min-w-48 border rounded-lg p-3"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Search
        </button>

        <Link href="/products" className="border rounded-lg px-5 py-3">
          Clear
        </Link>
      </form>

      {/* Product list */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Category</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Price</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-4">{product.name}</td>

                <td className="p-4">{product.sku}</td>

                <td className="p-4">{product.category.name}</td>

                <td className="p-4">{product.supplier?.name ?? "—"}</td>

                <td className="p-4">{product.price.toString()}</td>

                <td className="p-4">{product.quantity}</td>

                <td className="p-4">
                  <div className="flex gap-4">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="text-blue-600"
                    >
                      Edit
                    </Link>

                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="p-4 text-gray-500">
            {query ? "No matching products found." : "No products found."}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>

        <Link
          href="/products/new"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          + Add Product
        </Link>
      </div>

      <Suspense fallback={<p>Loading products...</p>}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
