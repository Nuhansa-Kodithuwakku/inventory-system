import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { createSupplier } from "@/actions/management-actions";
import FormField from "@/components/FormField";

async function SuppliersContent() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <form
        action={createSupplier}
        className="bg-white rounded-xl p-6 shadow space-y-4 max-w-lg"
      >
        <h2 className="text-xl font-semibold">Add Supplier</h2>

        <FormField
          name="name"
          label="Supplier Name"
          placeholder="ABC Electronics"
          required
          maxLength={120}
        />

        <FormField
          name="email"
          label="Email"
          type="email"
          placeholder="sales@example.com"
        />

        <FormField
          name="phone"
          label="Phone Number"
          type="tel"
          placeholder="+94 77 123 4567"
          maxLength={30}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Save Supplier
        </button>
      </form>

      <div className="bg-white rounded-xl p-6 shadow overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Supplier List</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Products</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b">
                <td className="p-3">{supplier.name}</td>
                <td className="p-3">{supplier.email ?? "-"}</td>
                <td className="p-3">{supplier.phone ?? "-"}</td>
                <td className="p-3">{supplier._count.products}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {suppliers.length === 0 && (
          <p className="mt-4 text-gray-500">No suppliers yet.</p>
        )}
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Suppliers</h1>

      <Suspense fallback={<p>Loading suppliers...</p>}>
        <SuppliersContent />
      </Suspense>
    </div>
  );
}
