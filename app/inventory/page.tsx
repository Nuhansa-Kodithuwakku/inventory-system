import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { recordStockMovement } from "@/actions/inventory-actions";
import { connection } from "next/server";

async function InventoryContent() {
  // Wait for an incoming request before executing database queries
  await connection();
  const [products, movements] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
    }),

    prisma.stockMovement.findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Stock movement form */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-6">Record Stock Movement</h2>

        <form action={recordStockMovement} className="space-y-5">
          <div>
            <label htmlFor="productId" className="block mb-2">
              Select Product
            </label>

            <select
              id="productId"
              name="productId"
              required
              defaultValue=""
              className="w-full border rounded-lg p-3"
            >
              <option value="" disabled>
                Select a product
              </option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - Stock: {product.quantity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="block mb-2">
              Movement Type
            </label>

            <select
              id="type"
              name="type"
              className="w-full border rounded-lg p-3"
            >
              <option value="IN">Stock IN</option>
              <option value="OUT">Stock OUT</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block mb-2">
              Quantity
            </label>

            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              step="1"
              required
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label htmlFor="note" className="block mb-2">
              Note
            </label>

            <textarea
              id="note"
              name="note"
              maxLength={250}
              placeholder="Supplier delivery, sale, damaged..."
              className="w-full border rounded-lg p-3"
            />
          </div>

          <button
            type="submit"
            disabled={products.length === 0}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            Save Movement
          </button>
        </form>
      </div>

      {/* Movement history */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-6">Recent Stock Movements</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-3">Product</th>
                <th className="p-3">Type</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Note</th>
                <th className="p-3">Date (UTC)</th>
              </tr>
            </thead>

            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b">
                  <td className="p-3">{movement.product.name}</td>

                  <td className="p-3">{movement.type}</td>

                  <td
                    className={
                      movement.type === "IN"
                        ? "p-3 text-green-600"
                        : "p-3 text-red-600"
                    }
                  >
                    {movement.type === "IN" ? "+" : "-"}
                    {movement.quantity}
                  </td>

                  <td className="p-3">{movement.note ?? "-"}</td>

                  <td className="p-3">
                    {movement.createdAt
                      .toISOString()
                      .slice(0, 16)
                      .replace("T", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {movements.length === 0 && (
            <p className="p-4 text-gray-500">
              No stock movements recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      <Suspense fallback={<p>Loading inventory...</p>}>
        <InventoryContent />
      </Suspense>
    </div>
  );
}
