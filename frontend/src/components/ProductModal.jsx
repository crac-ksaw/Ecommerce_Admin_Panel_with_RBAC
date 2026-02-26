import ProductMeta from "./ProductMeta.jsx";
import StatusBanner from "./StatusBanner.jsx";

export default function ProductModal({
  isOpen,
  mode,
  isAdmin,
  form,
  selected,
  status,
  onFieldChange,
  onSubmit,
  onClose,
}) {
  if (!isOpen) {
    return null;
  }

  const title = mode === "create" ? "Create Product" : "Edit Product";
  const salesNote = "Sales can edit name, description, and price only";

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {!isAdmin && <p className="muted">{salesNote}</p>}
          </div>
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </div>

        {mode === "edit" && <ProductMeta product={selected} />}

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
                disabled={!isAdmin && mode === "edit"}
                readOnly={!isAdmin && mode === "edit"}
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
                disabled={!isAdmin && mode === "edit"}
                readOnly={!isAdmin && mode === "edit"}
                required
              />
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => onFieldChange("status", event.target.value)}
                disabled={!isAdmin && mode === "edit"}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit">{mode === "create" ? "Create" : "Save"}</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>

        <StatusBanner status={status} />
      </div>
    </div>
  );
}
