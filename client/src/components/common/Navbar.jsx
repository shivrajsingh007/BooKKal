import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiBook, FiMenu, FiX, FiBell, FiMessageCircle, FiUser, FiLogOut, FiPlus, FiRepeat } from 'react-icons/fi';
import API from '../../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) fetchUnread();
  }, [user, location]);

  const fetchUnread = async () => {
    try {
      const { data } = await API.get('/notifications');
      setUnreadCount(data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/books', label: 'Browse Books' },
    { to: '/exchanges', label: 'Exchanges', auth: true },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors">
              <FiBook className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl text-dark">Book<span className="text-primary-500">Kal</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              !link.auth || user ? (
                <Link key={link.to} to={link.to}
                  className={`text-sm font-medium transition-colors ${location.pathname === link.to ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'}`}>
                  {link.label}
                </Link>
              ) : null
            )}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/add-book" className="btn-primary text-sm py-2 px-4">
                  <FiPlus /> List a Book
                </Link>

                <Link to="/chat" className="relative p-2 text-gray-500 hover:text-primary-500 transition-colors">
                  <FiMessageCircle className="text-xl" />
                </Link>

                <Link to="/dashboard" onClick={fetchUnread} className="relative p-2 text-gray-500 hover:text-primary-500 transition-colors">
                  <FiBell className="text-xl" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Avatar Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="font-semibold text-sm text-dark truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link to={`/profile/${user._id}`} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-500 transition-colors">
                        <FiUser className="text-base" /> My Profile
                      </Link>
                      <Link to="/profile/edit" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-500 transition-colors">
                        <FiRepeat className="text-base" /> Edit Profile
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <FiLogOut className="text-base" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Log In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-1">
            {navLinks.map((link) =>
              !link.auth || user ? (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  {link.label}
                </Link>
              ) : null
            )}
            {user ? (
              <>
                <Link to="/add-book" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-primary-500 font-medium">+ List a Book</Link>
                <Link to="/chat" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Messages</Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Dashboard</Link>
                <Link to={`/profile/${user._id}`} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">My Profile</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700">Log In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-semibold text-primary-500">Sign Up Free</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
