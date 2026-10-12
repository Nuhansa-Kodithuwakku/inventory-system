import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  const category = await prisma.category.upsert({
    where: { name: "Electronics" },
    update: {},
    create: {
      name: "Electronics",
    },
  });

  await prisma.product.upsert({
    where: { sku: "ELEC-001" },
    update: {},
    create: {
      name: "Wireless Mouse",
      sku: "ELEC-001",
      description: "Wireless optical mouse",
      price: "2500.00",
      quantity: 20,
      minimumStock: 5,
      categoryId: category.id,
    },
  });

  console.log("Sample product created!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
