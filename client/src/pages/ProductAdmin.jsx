import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productApi } from '../api';

export default function ProductAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // product id being edited
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    productApi
      .getAll()
      .then((res) => setProducts(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, description: p.description || '', price: String(p.price), stock: String(p.stock) });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', stock: '' });
  };

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description || undefined,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    };
    if (!data.name || Number.isNaN(data.price) || Number.isNaN(data.stock)) {
      toast.error('Please fill in all fields correctly.');
      return;
    }
    setSaving(true);
    const promise = editing
      ? productApi.update(editing, data)
      : productApi.create(data);
    promise
      .then((res) => {
        toast.success(editing ? 'Product updated' : 'Product created');
        setProducts((prev) => (editing
          ? prev.map((p) => (p.id === res.data.id ? res.data : p))
          : [...prev, res.data]));
        cancelEdit();
      })
      .catch(() => toast.error('Failed to save product'))
      .finally(() => setSaving(false));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this product?')) return;
    productApi.delete(id)
      .then(() => {
        toast.success('Product deleted');
        setProducts((prev) => prev.filter((p) => p.id !== id));
      })
      .catch(() => toast.error('Failed to delete product'));
  };

  if (loading) return <div className="container py-20">Loading products...</div>;

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <Link to="/" className="text-sm text-gray-600 hover:underline mb-2 inline-block">
            <ArrowLeft size={16} /> Back to shop
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Product Manager</h1>
          <p className="text-gray-600">Create, edit, and delete products.</p>
        </div>
      </div>

      {editing ? (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">Edit product</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange('name')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange('description')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange('price')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleChange('stock')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition"
                >
                  <Save size={18} /> {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">Add new product</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="e.g. Wireless Headphones"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange('description')}
                  placeholder="Optional description"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex justify-between">
                  <span>Price</span>
                  <span className="text-xs text-gray-500">USD</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">$</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange('price')}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stock quantity</label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange('stock')}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition"
              >
                <Plus size={18} /> {saving ? 'Creating...' : 'Create product'}
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <h2 className="px-6 py-4 border-b border-gray-100 text-lg font-semibold">Existing products</h2>
            <div className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">No products found.</div>
              ) : (
                products.map((p) => (
                  <div key={p.id} className="px-6 py-4 flex items-center justify-between group hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-medium">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{p.name}</div>
                        <div className="text-sm text-gray-500">${p.price.toFixed(2)} \u00b7 Stock {p.stock}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(p)}
                        className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Plus size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
