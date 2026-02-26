import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api";

const TABS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  PROMOS: "promos",
};

export default function Admin() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(TABS.USERS);

  // ✅ 1) Auth + load me
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error || "Unauthorized");
        setMe(data.user);
      })
      .catch((err) => {
        console.error("Admin auth error:", err);
        setError("You are not authorized to view this page.");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // ✅ 2) Derive permissions safely (works even when me is null)
  const role = me?.role;
  const canUsers = role === "admin";
  const canProducts = role === "admin" || role === "content";
  const canOrders = role === "admin" || role === "sales";
  const canPromos = role === "admin" || role === "marketing";

  // ✅ 3) Ensure current tab is allowed (MUST be before returns)
  useEffect(() => {
    // don’t run until auth check finished and me exists
    if (loading) return;
    if (!me) return;

    const allowedTabs = [];
    if (canUsers) allowedTabs.push(TABS.USERS);
    if (canProducts) allowedTabs.push(TABS.PRODUCTS);
    if (canOrders) allowedTabs.push(TABS.ORDERS);
    if (canPromos) allowedTabs.push(TABS.PROMOS);

    if (!allowedTabs.includes(tab)) {
      setTab(allowedTabs[0] || TABS.PRODUCTS);
    }
  }, [loading, me, tab, canUsers, canProducts, canOrders, canPromos]);

  // ✅ Now early returns are safe (all hooks already executed)
  if (loading) {
    return (
      <div className="p-6">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error || !me) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-red-600">{error || "Not authorized."}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">
        Signed in as <span className="font-semibold">{me.name}</span> ({me.role})
      </p>

      <div className="border-b mb-4 flex flex-wrap gap-2">
        {canUsers && (
          <TabButton active={tab === TABS.USERS} onClick={() => setTab(TABS.USERS)}>
            Users
          </TabButton>
        )}
        {canProducts && (
          <TabButton
            active={tab === TABS.PRODUCTS}
            onClick={() => setTab(TABS.PRODUCTS)}
          >
            Products
          </TabButton>
        )}
        {canOrders && (
          <TabButton active={tab === TABS.ORDERS} onClick={() => setTab(TABS.ORDERS)}>
            Orders
          </TabButton>
        )}
        {canPromos && (
          <TabButton active={tab === TABS.PROMOS} onClick={() => setTab(TABS.PROMOS)}>
            Promos
          </TabButton>
        )}
      </div>

      {tab === TABS.USERS && canUsers && <UsersPanel />}
      {tab === TABS.PRODUCTS && canProducts && <ProductsPanel />}
      {tab === TABS.ORDERS && canOrders && <OrdersPanel />}
      {tab === TABS.PROMOS && canPromos && <PromosPanel />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm border-b-2 -mb-px ${
        active
          ? "border-blue-600 text-blue-600 font-semibold"
          : "border-transparent text-gray-600 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load users");
      }
      setUsers(data.data || []);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create user");
      }
      setForm({ name: "", email: "", password: "", role: "customer" });
      loadUsers();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete user");
      }
      loadUsers();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Users</h2>
          <button
            onClick={loadUsers}
            className="text-sm px-3 py-1 border rounded"
            type="button"
          >
            Refresh
          </button>
        </div>
        {error && (
          <div className="mb-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {loading ? (
          <div>Loading users...</div>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.role}</td>
                  <td className="p-2 border text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(u._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h3 className="text-md font-semibold mb-2">Create User</h3>
        <form className="space-y-3" onSubmit={handleCreate}>
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="marketing">Marketing</option>
              <option value="content">Content</option>
              <option value="sales">Sales</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white text-sm py-2 rounded"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API}/api/products?limit=100`);
      const data = await res.json();
      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Products</h2>
        <button
          onClick={loadProducts}
          className="text-sm px-3 py-1 border rounded"
          type="button"
        >
          Refresh
        </button>
      </div>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div>Loading products...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Brand</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Base Price</th>
                <th className="p-2 border">Variants</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="p-2 border">{p.name}</td>
                  <td className="p-2 border">{p.brand}</td>
                  <td className="p-2 border">{p.category}</td>
                  <td className="p-2 border">Rs. {p.basePrice}</td>
                  <td className="p-2 border text-xs">
                    {Array.isArray(p.variants) &&
                      p.variants
                        .map((v) => `${v.color} (${(v.sizes || []).length} sizes)`)
                        .join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Note: For full CRUD (create/update/delete) you would typically build a
        separate product editor form. This panel shows a read-only admin view
        tied to the Task 8 product schema.
      </p>
    </div>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load orders");
      }
      setOrders(data.data || []);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(id, status) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }
      loadOrders();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Orders</h2>
        <button
          onClick={loadOrders}
          className="text-sm px-3 py-1 border rounded"
          type="button"
        >
          Refresh
        </button>
      </div>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">User</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Payment</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="p-2 border font-mono">
                    {String(o._id).slice(-8)}
                  </td>
                  <td className="p-2 border">
                    {o.userId?.name || "N/A"}
                    <div className="text-[10px] text-gray-500">
                      {o.userId?.email}
                    </div>
                  </td>
                  <td className="p-2 border">Rs. {o.total}</td>
                  <td className="p-2 border text-xs">
                    {o.paymentStatus}
                    {o.payherePaymentId && (
                      <div className="text-[10px] text-gray-500">
                        {o.payherePaymentId}
                      </div>
                    )}
                  </td>
                  <td className="p-2 border text-xs">{o.orderStatus}</td>
                  <td className="p-2 border text-right">
                    <select
                      className="border rounded px-1 py-0.5 text-xs"
                      value={o.orderStatus}
                      onChange={(e) =>
                        updateStatus(o._id, e.target.value)
                      }
                    >
                      <option value="created">created</option>
                      <option value="processing">processing</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PromosPanel() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    discountType: "percent",
    discountValue: 10,
    minAmount: "",
    maxUses: "",
    active: true,
  });

  async function loadPromos() {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/promo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load promos");
      }
      setPromos(data.data || []);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPromos();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/promo/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create promo");
      }
      setForm({
        code: "",
        discountType: "percent",
        discountValue: 10,
        minAmount: "",
        maxUses: "",
        active: true,
      });
      loadPromos();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleToggleActive(id, active) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/promo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update promo");
      }
      loadPromos();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this promo?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/promo/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete promo");
      }
      loadPromos();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Promos</h2>
          <button
            onClick={loadPromos}
            className="text-sm px-3 py-1 border rounded"
            type="button"
          >
            Refresh
          </button>
        </div>
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        {loading ? (
          <div>Loading promos...</div>
        ) : (
          <table className="w-full text-xs border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Code</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Value</th>
                <th className="p-2 border">Min</th>
                <th className="p-2 border">Uses</th>
                <th className="p-2 border">Active</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p._id}>
                  <td className="p-2 border font-mono">{p.code}</td>
                  <td className="p-2 border">{p.discountType}</td>
                  <td className="p-2 border">{p.discountValue}</td>
                  <td className="p-2 border">{p.minAmount || "-"}</td>
                  <td className="p-2 border">
                    {p.uses || 0}
                    {p.maxUses ? ` / ${p.maxUses}` : ""}
                  </td>
                  <td className="p-2 border">
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={(e) =>
                        handleToggleActive(p._id, e.target.checked)
                      }
                    />
                  </td>
                  <td className="p-2 border text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(p._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div>
        <h3 className="text-md font-semibold mb-2">Create Promo</h3>
        <form className="space-y-3" onSubmit={handleCreate}>
          <div>
            <label className="block text-sm mb-1">Code</label>
            <input
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.discountType}
              onChange={(e) =>
                setForm({ ...form, discountType: e.target.value })
              }
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Value</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1 text-sm"
              value={form.discountValue}
              onChange={(e) =>
                setForm({
                  ...form,
                  discountValue: Number(e.target.value || 0),
                })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm mb-1">Min Amount</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1 text-sm"
                value={form.minAmount}
                onChange={(e) =>
                  setForm({ ...form, minAmount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Max Uses</label>
              <input
                type="number"
                className="w-full border rounded px-2 py-1 text-sm"
                value={form.maxUses}
                onChange={(e) =>
                  setForm({ ...form, maxUses: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm({ ...form, active: e.target.checked })
              }
            />
            <span>Active</span>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white text-sm py-2 rounded"
          >
            Create Promo
          </button>
        </form>
      </div>
    </div>
  );
}