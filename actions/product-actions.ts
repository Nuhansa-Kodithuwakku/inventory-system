"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().trim().min(2),
  sku: z.string().trim().min(1),
  description: z.string().trim().max(500),

  price: z
    .string()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, "Invalid price")
    .refine((value) => Number(value) > 0),

  quantity: z.number().int().min(0),
  minimumStock: z.number().int().min(0),
  categoryId: z.number().int().positive(),
  supplierId: z.number().int().positive().nullable(),
});

function readOptionalSupplierId(value: FormDataEntryValue | null) {
  if (value === null || value === "") {
    return null;
  }

  return readNumber(value);
}

// Convert form input to a number safely.
function readNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return NaN;
  }

  return Number(value);
}

export async function createProduct(formData: FormData) {
  const result = productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    quantity: readNumber(formData.get("quantity")),
    minimumStock: readNumber(formData.get("minimumStock")),
    categoryId: readNumber(formData.get("categoryId")),
    supplierId: readOptionalSupplierId(formData.get("supplierId")),
  });

  if (!result.success) {
    throw new Error("Invalid product information");
  }

  const data = result.data;

  // Prevent duplicate SKUs.
  const existingProduct = await prisma.product.findUnique({
    where: { sku: data.sku },
  });

  if (existingProduct) {
    throw new Error("A product with this SKU already exists");
  }

  // Save product to PostgreSQL.

  await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      minimumStock: data.minimumStock,
      categoryId: data.categoryId,
      supplierId: data.supplierId,

      ...(data.quantity > 0
        ? {
            stockMovements: {
              create: {
                type: "IN",
                quantity: data.quantity,
                note: "Opening stock",
              },
            },
          }
        : {}),
    },
  });

  // Refresh the products listing.
  revalidatePath("/products");
  // Refresh the inventory dashboard.
  revalidatePath("/");

  // Navigate back to the products page.
  redirect("/products");
}

const editProductSchema = productSchema.omit({
  quantity: true,
});

function getProductId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new Error("Invalid product ID");
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id)) {
    throw new Error("Invalid product ID");
  }

  return id;
}

export async function updateProduct(formData: FormData) {
  const id = getProductId(formData.get("id"));

  const result = editProductSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    minimumStock: readNumber(formData.get("minimumStock")),
    categoryId: readNumber(formData.get("categoryId")),
    supplierId: readOptionalSupplierId(formData.get("supplierId")),
  });

  if (!result.success) {
    throw new Error("Invalid product information");
  }

  const data = result.data;

  await prisma.product.update({
    where: {
      id: id,
    },
    data: {
      name: data.name,
      sku: data.sku,
      description: data.description,
      price: data.price,
      minimumStock: data.minimumStock,
      categoryId: data.categoryId,
      supplierId: data.supplierId,
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${id}/edit`);
  revalidatePath("/");

  redirect("/products");
}

export async function deleteProduct(formData: FormData) {
  const id = getProductId(formData.get("id"));

  await prisma.product.delete({
    where: {
      id,
    },
  });

  revalidatePath("/products");
  revalidatePath("/");

  redirect("/products");
}
