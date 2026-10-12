"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
});

const supplierSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.union([z.email(), z.literal("")]),
  phone: z.string().trim().max(30),
});

// CREATE CATEGORY
export async function createCategory(formData: FormData) {
  const result = categorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    throw new Error("Invalid category name");
  }

  const { name } = result.data;

  const existing = await prisma.category.findUnique({
    where: { name },
  });

  if (existing) {
    throw new Error("Category already exists");
  }

  await prisma.category.create({
    data: { name },
  });

  revalidatePath("/categories");
  revalidatePath("/products/new");
  revalidatePath("/products");
  revalidatePath("/");

  redirect("/categories");
}

// CREATE SUPPLIER
export async function createSupplier(formData: FormData) {
  const result = supplierSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
  });

  if (!result.success) {
    throw new Error("Invalid supplier information");
  }

  const { name, email, phone } = result.data;

  await prisma.supplier.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
    },
  });

  revalidatePath("/suppliers");
  revalidatePath("/products/new");
  revalidatePath("/products");

  redirect("/suppliers");
}
