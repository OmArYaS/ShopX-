import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, RefreshCw, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cartApi, orderApi, USER_ID } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(new Set());
  const navigate = useNavigate();

  const fetchCart = () => {
    cartApi
      .get(USER_ID)
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('Failed to load cart'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setUpdating((prev) => new Set([...prev, id]));
    cartApi.updateQuantity(id, USER_ID, qty)
      .then((res) => {
        setItems((prev) => prev.map((i) => (i.id === id ? res.data : i)));
        toast.success('Cart updated');
      })
      .catch(() => toast.error('Failed to update quantity'))
      .finally(() => setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }));
  };

  const removeItem = (id) => {
    setUpdating((prev) => new Set([...prev, id]));
    cartApi.remove(id, USER_ID)
      .then(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success('Item removed');
      })
      .catch(() => toast.error('Failed to remove item'))
      .finally(() => setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }));
  };

  const clearCart = () => {
    if (!window.confirm('Clear your entire cart?')) return;
    cartApi.clear(USER_ID)
      .then(() => {
        setItems([]);
        toast.success('Cart cleared');
      })
      .catch(() => toast.error('Failed to clear cart'));
  };

  const placeOrder = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    orderApi.place(USER_ID)
      .then((res) => {
        toast.success('Order placed!');
        navigate(`/orders/${res.data.id}`);
      })
      .catch((err) => toast.error(err.response?.data?.title || 'Failed to place order'));
  };

  const subtotal = items.reduce((sum, i) => sum + (i.lineTotal || 0), 0);

  if (loading) return <div className="container py-20">Loading cart...</div>;

  return (
    <div className="container py-8">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 opacity-30">
            <Trash2 size={64} />
          </div>
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-gray-600">Add some products to get started.</p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-brand-600 font-semibold hover:underline">
            Browse products <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <h2 className="text-xl font-bold mb-6">Cart ({items.length})</h2>
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">Unit price</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">Qty</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-3 text-sm font-semibold text-gray-700"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-medium">
                            {item.productName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          onChange={(e) => updateQty(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                          disabled={updating.has(item.id)}
                          className="w-14 h-9 rounded-lg border border-gray-300 text-center text-sm disabled:opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">${item.lineTotal.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={updating.has(item.id)}
                          className="text-sm text-red-600 hover:text-red-800 underline"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={clearCart}
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCw size={16} /> Clear cart
              </button>
            </div>
          </div>
          <div className="lg:w-1/3">
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 sticky top-24">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Order summary</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={placeOrder}
                disabled={items.length === 0}
                className="w-full py-3 rounded-lg bg-brand-600 text-white font-semibold text-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow"
              >
                Place order <ArrowRight size={18} />
              </button>
              <p className="mt-4 text-xs text-gray-500 text-center">
                Order will be created as <strong>{USER_ID}</strong> (demo user).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
