import ProductMeta from "./ProductMeta.jsx";
import StatusBanner from "./StatusBanner.jsx";

export default function ProductEditorCard({
  isAdmin,
  selected,
  form,
  status,
  onFieldChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="card">
      {isAdmin && (
        <>
          <div className="section-title">
            <h2>{selected ? "Edit Product" : "Create Product"}</h2>
            <span className="muted">Full access</span>
          </div>
          <ProductMeta product={selected} />

          <form onSubmit={onSubmit} className="form">
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={(event) => onFieldChange("name", event.target.value)}
                required
              />
            </label>
            <label>
              Description
              <textarea
                rows="3"
                value={form.description}
                onChange={(event) => onFieldChange("description", event.target.value)}
                required
              />
            </label>
            <div className="form-row">
              <label>
                Price
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => onFieldChange("price", event.target.value)}
                  required
                />
              </label>
              <label>
                SKU
                <input
                  type="text"
                  value={form.sku}
                  onChange={(event) => onFieldChange("sku", event.target.value)}
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Inventory
                <input
                  type="number"
                  value={form.inventoryQuantity}
                  onChange={(event) =>
                    onFieldChange("inventoryQuantity", event.target.value)
                  }
                  required
                />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) => onFieldChange("status", event.target.value)}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit">{selected ? "Save Changes" : "Create"}</button>
              {selected && (
                <button type="button" onClick={onCancel}>
                  Cancel
                </button>
              )}
            </div>
          </form>
          <StatusBanner status={status} />
        </>
      )}

      {!isAdmin && selected && (
        <>
          <div className="section-title">
            <h2>Edit Product</h2>
            <span className="muted">
              Sales can edit name, description, and price only
            </span>
          </div>
          <ProductMeta product={selected} />

          <form onSubmit={onSubmit} className="form">
            <label>
              Name
              <input
                type="text"
                value={form.name}
                onChange={(event) => onFieldChange("name", event.target.value)}
                required
              />
            </label>
            <label>
              Description
              <textarea
                rows="3"
                value={form.description}
                onChange={(event) => onFieldChange("description", event.target.value)}
                required
              />
            </label>
            <label>
              Price
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(event) => onFieldChange("price", event.target.value)}
                required
              />
            </label>
            <div className="form-row">
              <label>
                SKU
                <input type="text" value={form.sku} readOnly disabled />
              </label>
              <label>
                Inventory
                <input
                  type="number"
                  value={form.inventoryQuantity}
                  readOnly
                  disabled
                />
              </label>
            </div>
            <label>
              Status
              <select value={form.status} disabled>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <div className="form-actions">
              <button type="submit">Save Changes</button>
              <button type="button" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
          <StatusBanner status={status} />
        </>
      )}

      {!isAdmin && !selected && (
        <>
          <div className="section-title">
            <h2>Sales Workspace</h2>
            <span className="muted">Select a product to edit name and price</span>
          </div>
          <StatusBanner status={status} />
        </>
      )}
    </div>
  );
}
