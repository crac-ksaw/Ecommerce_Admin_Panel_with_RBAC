import { Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import {
  productCreateSchema,
  productUpdateSchema,
  productSalesUpdateSchema,
} from "../validators/product";
import {
  createProduct,
  listProducts,
  softDeleteProduct,
  updateProduct,
  updateProductSales,
} from "../services/productService";
import { sendSuccess } from "../utils/apiResponse";

function serializeProduct(product: any) {
  return {
    ...product,
    status: product.status.toLowerCase(),
  };
}

export async function list(_req: Request, res: Response) {
  const products = await listProducts();
  return sendSuccess(res, 200, products.map(serializeProduct));
}

export async function create(req: Request, res: Response) {
  const data = productCreateSchema.parse(req.body);
  const product = await createProduct(data);
  return sendSuccess(res, 201, serializeProduct(product));
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new HttpError(400, "Invalid product id");
  }

  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  if (req.user.role === "Admin") {
    const data = productUpdateSchema.parse(req.body);
    const product = await updateProduct(id, data);
    return sendSuccess(res, 200, serializeProduct(product));
  }

  const data = productSalesUpdateSchema.parse(req.body);
  if (
    data.name === undefined &&
    data.description === undefined &&
    data.price === undefined
  ) {
    throw new HttpError(400, "Nothing to update");
  }

  const product = await updateProductSales(id, data);
  return sendSuccess(res, 200, serializeProduct(product));
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new HttpError(400, "Invalid product id");
  }

  await softDeleteProduct(id);
  return sendSuccess(res, 200, { message: "Product deleted" });
}
