import { formatPrice } from "../utils/formatters.js";

export default function ProductListCard({
  products,
  isAdmin,
  onEdit,
  onDelete,
  onCreate,
}) {
  return (
    <div className="card">
      <div className="section-title">
        <div>
          <h2>Products</h2>
          <span className="muted">{products.length} total</span>
        </div>
        {isAdmin && (
          <button type="button" className="primary" onClick={onCreate}>
            Create Product
          </button>
        )}
      </div>

      <div className="list">
        {products.map((product) => (
          <div key={product.id} className="product-row">
            <div>
              <h4>{product.name}</h4>
              <p className="muted">{product.sku}</p>
            </div>
            <div className="product-meta">
              <span>{formatPrice(product.price)}</span>
              <span className={`status ${product.status}`}>{product.status}</span>
            </div>
            <div className="product-actions">
              <button type="button" onClick={() => onEdit(product)}>
                Edit
              </button>
              {isAdmin && (
                <button
                  type="button"
                  className="danger"
                  onClick={() => onDelete(product.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
