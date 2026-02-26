import { ProductStatus } from "@prisma/client";
import prisma from "../utils/prisma";
import { HttpError } from "../utils/httpError";

export type ProductCreateInput = {
  name: string;
  description: string;
  price: number;
  sku: string;
  inventoryQuantity: number;
  status: "active" | "inactive";
};

export type ProductUpdateInput = ProductCreateInput;

export type ProductSalesUpdateInput = {
  name?: string;
  description?: string;
  price?: number;
};

function mapStatus(status: "active" | "inactive"): ProductStatus {
  return status === "active" ? ProductStatus.ACTIVE : ProductStatus.INACTIVE;
}

async function assertActiveProductExists(id: number) {
  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
  });

  if (!product) {
    throw new HttpError(404, "Record not found");
  }
}

export async function listProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(input: ProductCreateInput) {
  return prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      sku: input.sku,
      inventoryQuantity: input.inventoryQuantity,
      status: mapStatus(input.status),
    },
  });
}

export async function updateProduct(id: number, input: ProductUpdateInput) {
  await assertActiveProductExists(id);

  return prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      sku: input.sku,
      inventoryQuantity: input.inventoryQuantity,
      status: mapStatus(input.status),
    },
  });
}

export async function updateProductSales(id: number, input: ProductSalesUpdateInput) {
  await assertActiveProductExists(id);

  return prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
    },
  });
}

export async function softDeleteProduct(id: number) {
  const result = await prisma.product.updateMany({
    where: { id, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  if (result.count === 0) {
    throw new HttpError(404, "Record not found");
  }
}

// Internal helper for future operations (not exposed via routes).
async function restoreSoftDeletedProduct(id: number) {
  return prisma.product.updateMany({
    where: { id, deletedAt: { not: null } },
    data: { deletedAt: null },
  });
}

void restoreSoftDeletedProduct;
