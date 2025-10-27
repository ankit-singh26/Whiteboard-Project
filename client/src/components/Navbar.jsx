import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const AuthLinks = () => (
    <>
      <Link
        to="/home"
        className="block md:inline-block px-3 py-2 font-medium hover:underline hover:text-blue-300 transition-colors"
      >
        Home
      </Link>
      <button
        onClick={logout}
        className="block md:inline-block px-3 py-2 font-medium hover:underline hover:text-blue-300 transition-colors"
      >
        Logout
      </button>
    </>
  );

  const GuestLinks = () => (
    <>
      <Link
        to="/login"
        className="block md:inline-block px-3 py-2 font-medium hover:underline hover:text-blue-300 transition-colors"
      >
        Login
      </Link>
      <Link
        to="/"
        className="block md:inline-block px-3 py-2 font-medium hover:underline hover:text-blue-300 transition-colors"
      >
        Sign Up
      </Link>
    </>
  );

  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <h1 className="text-xl font-bold tracking-wide">CollabCanvas</h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-2 items-center">
          {isAuthenticated ? <AuthLinks /> : <GuestLinks />}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white hover:text-blue-300 transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 py-4 bg-blue-900 space-y-3 border-t border-blue-800">
          {isAuthenticated ? (
            <>
              <Link
                to="/home"
                className="block font-medium hover:text-blue-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="block font-medium hover:text-blue-300 transition-colors w-full text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block font-medium hover:text-blue-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/"
                className="block font-medium hover:text-blue-300 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
