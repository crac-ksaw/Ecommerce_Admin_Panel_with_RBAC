import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  sku: z.string().min(3),
  inventoryQuantity: z.number().int().nonnegative(),
  status: z.enum(["active", "inactive"]),
});

export const productUpdateSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  sku: z.string().min(3),
  inventoryQuantity: z.number().int().nonnegative(),
  status: z.enum(["active", "inactive"]),
});

export const productSalesUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(5).optional(),
  price: z.number().positive().optional(),
});
