import { formatDateTime } from "../utils/formatters.js";

export default function ProductMeta({ product }) {
  if (!product) {
    return null;
  }

  return (
    <div className="meta-grid">
      <div>
        <p className="meta-label">Product ID</p>
        <p>{product.id}</p>
      </div>
      <div>
        <p className="meta-label">Created At</p>
        <p>{formatDateTime(product.createdAt)}</p>
      </div>
      <div>
        <p className="meta-label">Updated At</p>
        <p>{formatDateTime(product.updatedAt)}</p>
      </div>
    </div>
  );
}
