"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const stockSchema = z.object({
  productId: z.number().int().positive(),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().int().positive(),
  note: z.string().trim().max(250),
});

export async function recordStockMovement(formData: FormData) {
  // Step 1: Read form values
  const result = stockSchema.safeParse({
    productId: Number(formData.get("productId")),
    type: formData.get("type"),
    quantity: Number(formData.get("quantity")),
    note: formData.get("note") ?? "",
  });

  if (!result.success) {
    throw new Error("Invalid stock movement information");
  }

  const { productId, type, quantity, note } = result.data;

  // Step 2: Perform a database transaction
  await prisma.$transaction(async (tx) => {
    if (type === "IN") {
      // Increase stock
      await tx.product.update({
        where: { id: productId },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });
    } else {
      // Decrease stock ONLY if enough stock exists
      const updated = await tx.product.updateMany({
        where: {
          id: productId,
          quantity: {
            gte: quantity,
          },
        },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });

      if (updated.count !== 1) {
        throw new Error("Insufficient stock or product not found");
      }
    }

    // Step 3: Record the movement
    await tx.stockMovement.create({
      data: {
        productId,
        type,
        quantity,
        note: note || null,
      },
    });
  });

  // Step 4: Refresh affected pages
  revalidatePath("/inventory");
  revalidatePath("/products");
  revalidatePath("/");

  redirect("/inventory");
}
