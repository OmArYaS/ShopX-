import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Layout, List, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cartApi, USER_ID } from '../api';

const links = [
  { to: '/', label: 'Home', icon: <Layout size={17} /> },
  { to: '/cart', label: 'Cart', icon: <ShoppingCart size={17} /> },
  { to: '/orders', label: 'Orders', icon: <List size={17} /> },
  { to: '/admin/products', label: 'Admin', icon: <Settings size={17} /> },
];

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    cartApi
      .get(USER_ID)
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        setCartCount(items.reduce((sum, i) => sum + (i.quantity || 0), 0));
      })
      .catch(() => setCartCount(0))
      .finally(() => setLoading(false));
  }, []);

  return (
    <nav className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-brand-600">
          <ShoppingCart size={22} fill="none" stroke="currentColor" strokeWidth={2} />
          <span>ShopX</span>
        </Link>
        <div className="flex items-center gap-3">
          {links.map((link) => {
            const active =
              location.pathname === link.to ||
              (link.to !== '/' && location.pathname.startsWith(link.to));
            const showBadge = link.to === '/cart' && cartCount > 0;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition ${
                  active
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {link.icon} {link.label}
                {showBadge && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white shadow">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            onClick={() =>
              toast('Demo store \u2014 no sign-in required. Cart/user: demo-user', { icon: '\u2705' })
            }
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition"
          >
            Demo user
          </button>
        </div>
      </div>
    </nav>
  );
}
