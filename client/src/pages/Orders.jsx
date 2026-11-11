import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { orderApi, USER_ID } from '../api';
import StatusBadge, { statusLabel } from '../components/StatusBadge';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orderApi
      .getByUser(USER_ID)
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const placeNewOrder = () => navigate('/cart');

  if (loading) return <div className="container py-20">Loading orders...</div>;

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-gray-600">Track your order history and status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/cart" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <Clock size={16} /> New order
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 opacity-30">
            <CheckCircle2 size={64} />
          </div>
          <h2 className="text-xl font-semibold">No orders yet</h2>
          <p className="text-gray-600 mb-6">Place your first order from the cart.</p>
          <button onClick={placeNewOrder} className="px-6 py-2.5 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition">
            Go to cart <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Order #</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Total</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Items</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length ?? 0}</td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-brand-600 text-sm font-medium hover:underline"
                    >
                      View details
                    </Link>
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
