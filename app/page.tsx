import { Suspense } from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";

// This component queries the database.
async function DashboardContent() {
  const [products, categoryCount, movements] = await Promise.all([
    // Get products needed for statistics.
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        minimumStock: true,
      },
    }),

    // Count categories.
    prisma.category.count(),

    // Get the 8 most recent stock movements.
    prisma.stockMovement.findMany({
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    }),
  ]);

  // Calculate total quantity.
  const totalUnits = products.reduce(
    (sum, product) => sum + product.quantity,
    0,
  );

  // Find products that need restocking.
  const lowStockProducts = products
    .filter((product) => product.quantity <= product.minimumStock)
    .sort((a, b) => a.quantity - b.quantity);

  // Dashboard statistics.
  const stats = [
    {
      title: "Total Products",
      value: products.length,
    },
    {
      title: "Total Units",
      value: totalUnits,
    },
    {
      title: "Low Stock",
      value: lowStockProducts.length,
    },
    {
      title: "Categories",
      value: categoryCount,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500">{stat.title}</p>

            <h2 className="text-3xl font-bold mt-3">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Low stock products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-5">Low Stock Alerts</h2>

          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500">No low stock products.</p>
          ) : (
            <div className="space-y-4">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    <Link href="/inventory" className="text-sm text-blue-600">
                      Manage stock
                    </Link>
                  </div>

                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                    {product.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent stock movement history */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-5">Recent Stock Movements</h2>

          {movements.length === 0 ? (
            <p className="text-gray-500">No stock movements yet.</p>
          ) : (
            <div className="space-y-4">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex justify-between items-center border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{movement.product.name}</p>

                    <p className="text-sm text-gray-500">
                      {movement.createdAt
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}{" "}
                      UTC
                    </p>
                  </div>

                  <span
                    className={
                      movement.type === "IN"
                        ? "font-bold text-green-600"
                        : "font-bold text-red-600"
                    }
                  >
                    {movement.type === "IN" ? "+" : "-"}
                    {movement.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Displayed while database queries are running.
function DashboardLoading() {
  return (
    <div className="bg-white rounded-xl p-6">
      <p className="text-gray-500">Loading dashboard statistics...</p>
    </div>
  );
}

// Main dashboard page.
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>

      <p className="text-gray-500 mb-8">Overview of your inventory.</p>

      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
