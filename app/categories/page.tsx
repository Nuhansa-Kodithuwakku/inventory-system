import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { createCategory } from "@/actions/management-actions";
import FormField from "@/components/FormField";
import { connection } from "next/server";

async function CategoriesContent() {
  // Wait for an incoming request before executing database queries
  await connection();
  const categories = await prisma.category.findMany({
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
        action={createCategory}
        className="bg-white rounded-xl p-6 shadow space-y-4 max-w-lg"
      >
        <h2 className="text-xl font-semibold">Add Category</h2>

        <FormField
          name="name"
          label="Category Name"
          placeholder="Electronics"
          required
          maxLength={80}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Save Category
        </button>
      </form>

      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Products</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b">
                <td className="p-3">{category.name}</td>
                <td className="p-3">{category._count.products}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <p className="mt-4 text-gray-500">No categories yet.</p>
        )}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Categories</h1>

      <Suspense fallback={<p>Loading categories...</p>}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
