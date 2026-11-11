import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { toast } from 'react-hot-toast';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
