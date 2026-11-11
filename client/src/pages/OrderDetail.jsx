import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { API_BASE } from '../api';
import { orderApi } from '../api';
import { toast } from 'react-hot-toast';
import StatusBadge, { statusLabel } from '../components/StatusBadge';

const STATUSES = [
  { value: 0, label: 'Pending' },
  { value: 1, label: 'Confirmed' },
  { value: 2, label: 'Shipped' },
  { value: 3, label: 'Delivered' },
  { value: 4, label: 'Cancelled' },
];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [connected, setConnected] = useState(false);

  const orderId = Number(id);

  useEffect(() => {
    orderApi
      .getById(orderId)
      .then((res) => {
        setOrder(res.data);
        setNewStatus(String(res.data.status));
      })
      .catch(() => {
        toast.error('Order not found');
        navigate('/orders');
      })
      .finally(() => setLoading(false));

    // SignalR: real-time order status updates
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/orders`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None)
      .build();

    connection
      .start()
      .then(() => connection.invoke('JoinOrder', String(orderId)))
      .then(() => {
        setConnected(true);
        connection.on('OrderStatusUpdated', (payload) => {
          const nextStatus = payload?.status;
          setOrder((o) => (o ? { ...o, status: nextStatus } : o));
          setNewStatus(String(nextStatus));
          toast.success(`Order status updated: ${statusLabel(nextStatus)}`, {
            icon: '\u2705',
          });
        });
      })
      .catch((err) => {
        console.warn('SignalR unavailable (orders still work):', err);
        setConnected(false);
      });

    return () => connection.stop();
  }, [orderId, navigate]);

  const handleStatusChange = (e) => {
    e.preventDefault();
    const status = Number(newStatus);
    if (!Number.isFinite(status)) return;
    setSaving(true);
    orderApi
      .updateStatus(orderId, status)
      .then((res) => {
        setOrder(res.data);
        setNewStatus(String(res.data.status));
        toast.success(`Status changed to ${statusLabel(res.data.status)}`);
      })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => setSaving(false));
  };

  if (loading) return <div className="container py-20">Loading order...</div>;
  if (!order) return null;

  return (
    <div className="container py-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline mb-6">
        \u2190 Back to orders
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Order #{order.id}</h1>
                <p className="text-gray-600">Customer: {order.userId}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
                <span className={`text-xs font-medium ${connected ? 'text-green-700' : 'text-gray-500'}`}>
                  {connected ? 'Live updates connected' : 'Live updates offline'}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              Placed <strong>{new Date(order.createdAt).toLocaleString()}</strong>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Order status</label>
              <StatusBadge status={order.status} className="mb-3 block w-fit" />
              <form onSubmit={handleStatusChange} className="space-y-2">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={saving}
                  className="w-full max-w-xs py-2 pl-3 pr-10 rounded-lg border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none disabled:opacity-60 transition"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full max-w-xs py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-60 transition"
                >
                  {saving ? 'Updating...' : 'Update status'}
                </button>
                <p className="text-xs text-gray-500">
                  Changes are broadcast in real time to anyone viewing this order.
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <h2 className="px-6 py-4 border-b border-gray-100 text-lg font-semibold">
              Order items ({order.items?.length ?? 0})
            </h2>
            <div className="divide-y divide-gray-100">
              {(order.items ?? []).map((item) => (
                <div key={`${order.id}-${item.productId}`} className="px-6 py-4 flex items-center justify-between group hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {item.productName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-500">Qty {item.quantity}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">${item.unitPrice.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">${item.quantity * item.unitPrice}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 p-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
