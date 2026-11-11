import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { productApi } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi
      .getById(Number(id))
      .then((res) => setProduct(res.data))
      .catch(() => {
        toast.error('Product not found');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="container py-20">Loading product...</div>;
  if (!product) return null;

  const inStock = product.stock > 0;

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <div className="h-80 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
            <span className="text-6xl font-bold text-gray-400">
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        <div className="lg:w-1/2 flex flex-col">
          <Link to="/" className="text-sm text-brand-600 hover:underline mb-2">
            Back to catalog
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-lg text-gray-600">${product.price.toFixed(2)}</p>
          {product.description && (
            <p className="mt-4 text-gray-700 leading-relaxed">{product.description}</p>
          )}
          <div className="mt-6 flex items-center gap-2">
            <StatusBadge status={inStock ? product.stock : 0} />
            <span className={`text-sm font-medium ${inStock ? 'text-green-700' : 'text-red-700'}`}>
              {inStock ? `In stock: ${product.stock}` : 'Out of stock'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Created: {new Date(product.createdAt).toLocaleDateString()}</p>

          <div className="mt-8 flex gap-3">
            <button
              disabled={!inStock}
              className="flex-1 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              onClick={() => navigate('/cart')}
            >
              Buy now
            </button>
            <Link to="/admin/products" className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Edit product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
