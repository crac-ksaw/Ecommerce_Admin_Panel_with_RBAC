import { useEffect, useState } from "react";
import { apiRequest } from "./api.js";
import HeaderBar from "./components/HeaderBar.jsx";
import LoginCard from "./components/LoginCard.jsx";
import ProductListCard from "./components/ProductListCard.jsx";
import ProductModal from "./components/ProductModal.jsx";
import { clearAuth, getStoredAuth, storeAuth } from "./utils/authStorage.js";
import "./styles/app.css";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  sku: "",
  inventoryQuantity: "",
  status: "active",
};

const emptyLoginForm = { email: "", password: "" };
const emptyStatus = { type: "idle", message: "" };

export default function App() {
  const [token, setToken] = useState(() => getStoredAuth().token);
  const [user, setUser] = useState(() => getStoredAuth().user);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [status, setStatus] = useState(emptyStatus);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");

  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    if (!token) return;
    void loadProducts();
  }, [token]);

  useEffect(() => {
    if (token) return;
    resetLoginViewState();
  }, [token]);

  useEffect(() => {
    if (token) return;
    resetLoginViewState();
  }, []);

  useEffect(() => {
    if (!selected) {
      setForm(emptyProduct);
      return;
    }

    setForm({
      name: selected.name,
      description: selected.description,
      price: String(selected.price),
      sku: selected.sku,
      inventoryQuantity: String(selected.inventoryQuantity),
      status: selected.status,
    });
  }, [selected]);

  function updateStatus(type, message) {
    setStatus({ type, message });
  }

  function resetLoginViewState() {
    setLoginForm(emptyLoginForm);
    setStatus(emptyStatus);
    setSelected(null);
    setForm(emptyProduct);
    setModalOpen(false);
  }

  function handleLogout() {
    clearAuth();
    setToken("");
    setUser(null);
    setProducts([]);
    resetLoginViewState();
  }

  function handleAuthError(error) {
    if (error?.status !== 401) {
      return false;
    }

    handleLogout();
    return true;
  }

  async function loadProducts() {
    try {
      const data = await apiRequest("/api/products", { token });
      setProducts(data);
    } catch (error) {
      if (handleAuthError(error)) return;
      updateStatus("error", error.message);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    updateStatus("idle", "");

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: loginForm,
      });
      setToken(data.token);
      setUser(data.user);
      storeAuth(data.token, data.user);
      updateStatus("idle", "");
    } catch (error) {
      updateStatus("error", error.message);
    }
  }

  async function handleCreate() {
    if (!isAdmin) {
      updateStatus("error", "Admin role required to create products.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      sku: form.sku.trim(),
      inventoryQuantity: Number(form.inventoryQuantity),
      status: form.status,
    };

    await apiRequest("/api/products", {
      method: "POST",
      token,
      body: payload,
    });

    updateStatus("success", "Product created");
    setSelected(null);
    await loadProducts();
  }

  async function handleUpdate() {
    if (!selected) return;

    const payload = isAdmin
      ? {
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          sku: form.sku.trim(),
          inventoryQuantity: Number(form.inventoryQuantity),
          status: form.status,
        }
      : {
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
        };

    await apiRequest(`/api/products/${selected.id}`, {
      method: "PUT",
      token,
      body: payload,
    });

    updateStatus("success", "Product updated");
    await loadProducts();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    updateStatus("idle", "");

    try {
      if (modalMode === "edit") {
        await handleUpdate();
      } else {
        await handleCreate();
      }
      handleModalClose();
    } catch (error) {
      if (handleAuthError(error)) return;
      updateStatus("error", error.message);
    }
  }

  async function handleDelete(productId) {
    if (!window.confirm("Delete this product?")) return;

    try {
      await apiRequest(`/api/products/${productId}`, {
        method: "DELETE",
        token,
      });
      updateStatus("success", "Product deleted");
      setSelected(null);
      await loadProducts();
    } catch (error) {
      if (handleAuthError(error)) return;
      updateStatus("error", error.message);
    }
  }

  function handleProductSelect(product) {
    setSelected(product);
    setModalMode("edit");
    setModalOpen(true);
  }

  function handleCreateOpen() {
    setSelected(null);
    setForm(emptyProduct);
    setModalMode("create");
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setSelected(null);
    setForm(emptyProduct);
    updateStatus("idle", "");
  }

  function handleFormFieldChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleLoginFieldChange(field, value) {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  }

  if (!token) {
    return (
      <LoginCard
        loginForm={loginForm}
        onChange={handleLoginFieldChange}
        onSubmit={handleLogin}
        status={status}
      />
    );
  }

  return (
    <div className="page">
      <HeaderBar user={user} isAdmin={isAdmin} onLogout={handleLogout} />

      <section className="grid">
        <ProductListCard
          products={products}
          isAdmin={isAdmin}
          onEdit={handleProductSelect}
          onDelete={handleDelete}
          onCreate={handleCreateOpen}
        />
      </section>

      <ProductModal
        isOpen={modalOpen}
        mode={modalMode}
        isAdmin={isAdmin}
        form={form}
        selected={selected}
        status={status}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleSubmit}
        onClose={handleModalClose}
      />
    </div>
  );
}
