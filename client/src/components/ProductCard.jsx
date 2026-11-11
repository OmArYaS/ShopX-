import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cartApi } from '../api';

const USER_ID = 'demo-user';

export default function ProductCard({ product, onAdd }) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const inStock = product.stock > 0;

  const handleAdd = (e) => {
    e.preventDefault();
    setAdding(true);
    cartApi
      .add({ UserId: USER_ID, ProductId: product.id, Quantity: qty })
      .then(() => {
        toast.success(`Added ${qty}\u00d7 ${product.name} to cart`);
        onAdd?.();
      })
      .catch(() => toast.error('Failed to add to cart'))
      .finally(() => setAdding(false));
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-400">
          {product.name.charAt(0).toUpperCase()}
        </span>
        {!inStock && (
          <span className="absolute top-2 right-2 px-2 py-1 rounded bg-red-600 text-xs font-semibold text-white shadow-sm">
            Out of stock
          </span>
        )}
        <span className="absolute top-2 left-2 px-2 py-1 rounded bg-white/90 text-xs font-semibold text-gray-700 shadow-sm">
          ${product.price.toFixed(2)}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/products/${product.id}`} className="block text-lg font-semibold text-gray-900 hover:text-brand-600">
              {product.name}
            </Link>
            {product.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`text-xs font-semibold rounded-full px-2 py-0.5 border ${
              inStock ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
            }`}
          >
            {inStock ? `In stock (${product.stock})` : 'Out of stock'}
          </span>
        </div>
        <div className="mt-auto pt-4 flex items-center gap-2">
          {!inStock ? (
            <button disabled className="flex-1 py-2.5 rounded-lg bg-gray-200 text-gray-500 text-sm font-semibold cursor-not-allowed">
              Unavailable
            </button>
          ) : (
            <>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className="w-14 h-9 rounded-lg border border-gray-300 text-center text-sm"
              />
              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex-1 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                <Plus size={16} />
                {adding ? 'Adding...' : 'Add to cart'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
