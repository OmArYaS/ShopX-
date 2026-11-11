const STATUS_LABELS = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'Shipped',
  3: 'Delivered',
  4: 'Cancelled',
};
const STATUS_COLORS = {
  0: 'bg-amber-100 text-amber-800 border-amber-200',
  1: 'bg-blue-100 text-blue-800 border-blue-200',
  2: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  3: 'bg-green-100 text-green-800 border-green-200',
  4: 'bg-red-100 text-red-800 border-red-200',
};

export const statusLabel = (s) => {
  const n = typeof s === 'number' ? s : Number(s);
  return Number.isFinite(n) ? STATUS_LABELS[n] : String(s);
};

export const statusColor = (s) => {
  const n = typeof s === 'number' ? s : Number(s);
  return Number.isFinite(n) ? STATUS_COLORS[n] : 'bg-gray-100 text-gray-600 border-gray-200';
};

export default function StatusBadge({ status, className }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        statusColor(status)
      } ${className || ''}`}
    >
      {statusLabel(status)}
    </span>
  );
}
