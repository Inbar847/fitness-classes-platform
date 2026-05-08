import { Link } from 'react-router-dom';
import { Dumbbell, List, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          Fitness Platform
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <Link
                to="/classes"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-indigo-600"
              >
                <List className="h-4 w-4" />
                Classes
              </Link>

              {user.role === 'trainee' && (
                <Link
                  to="/my-bookings"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-indigo-600"
                >
                  My Bookings
                </Link>
              )}

              {user.role === 'trainer' && (
                <Link
                  to="/trainer"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-indigo-600"
                >
                  <Dumbbell className="h-4 w-4" />
                  Trainer Dashboard
                </Link>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-indigo-600"
                >
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              )}

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                  <UserIcon className="h-5 w-5 text-indigo-600" />
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                  <p className="text-xs capitalize text-gray-500">{user.role}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};