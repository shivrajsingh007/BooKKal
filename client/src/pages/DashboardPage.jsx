import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import BookCard from '../components/books/BookCard';
import Spinner from '../components/common/Spinner';
import { FiPlus, FiBell, FiBook, FiRepeat, FiMessageCircle, FiCheck, FiStar } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const NOTIF_ICONS = {
  exchange_request: <FiRepeat className="text-purple-500" />,
  exchange_accepted: <FiCheck className="text-green-500" />,
  exchange_rejected: <FiBook className="text-red-400" />,
  new_message: <FiMessageCircle className="text-blue-500" />,
  new_review: <FiStar className="text-yellow-500" />,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [myBooks, setMyBooks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [booksRes, notifRes, exchRes] = await Promise.all([
          API.get('/books/my-books'),
          API.get('/notifications'),
          API.get('/exchange?role=received'),
        ]);
        setMyBooks(booksRes.data.books);
        setNotifications(notifRes.data.notifications);
        setExchanges(exchRes.data.exchanges.filter((e) => e.status === 'pending'));
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const markAllRead = async () => {
    await API.put('/notifications/read');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  if (loading) return <Spinner fullPage />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your books</p>
        </div>
        <Link to="/add-book" className="btn-primary">
          <FiPlus /> List a Book
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Books Listed', value: myBooks.length, icon: <FiBook />, color: 'text-primary-500 bg-primary-50' },
          { label: 'Active Books', value: myBooks.filter((b) => b.isAvailable).length, icon: <FiCheck />, color: 'text-green-500 bg-green-50' },
          { label: 'Pending Requests', value: exchanges.length, icon: <FiRepeat />, color: 'text-purple-500 bg-purple-50' },
          { label: 'Your Rating', value: user?.rating?.count > 0 ? `${user.rating.average}★` : 'N/A', icon: <FiStar />, color: 'text-yellow-500 bg-yellow-50' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-dark">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Books */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-dark">My Listed Books</h2>
            <Link to="/add-book" className="text-primary-500 text-sm hover:underline">+ Add new</Link>
          </div>
          {myBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myBooks.slice(0, 4).map((book) => (
                <div key={book._id} className="relative group">
                  <BookCard book={book} />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/edit-book/${book._id}`}
                      className="bg-white text-xs px-2 py-1 rounded-md shadow text-gray-600 hover:text-primary-500">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center text-gray-400">
              <FiBook className="text-5xl mx-auto mb-3" />
              <p className="mb-4">You haven't listed any books yet</p>
              <Link to="/add-book" className="btn-primary inline-flex"><FiPlus /> List your first book</Link>
            </div>
          )}
        </div>

        {/* Notifications & Requests */}
        <div className="space-y-6">
          {/* Pending Exchanges */}
          {exchanges.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-bold text-lg text-dark mb-4 flex items-center gap-2">
                <FiRepeat className="text-purple-500" /> Pending Requests ({exchanges.length})
              </h3>
              <div className="space-y-3">
                {exchanges.slice(0, 3).map((ex) => (
                  <Link key={ex._id} to={`/exchanges/${ex._id}`}
                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-sm font-bold">
                      {ex.requester?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark truncate">{ex.requester?.name}</p>
                      <p className="text-xs text-gray-500 truncate">wants "{ex.requestedBook?.title}"</p>
                    </div>
                  </Link>
                ))}
                <Link to="/exchanges" className="text-xs text-primary-500 hover:underline block text-center pt-1">
                  View all exchanges →
                </Link>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-dark flex items-center gap-2">
                <FiBell className="text-primary-500" /> Notifications
              </h3>
              {notifications.some((n) => !n.isRead) && (
                <button onClick={markAllRead} className="text-xs text-primary-500 hover:underline">Mark all read</button>
              )}
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.slice(0, 6).map((n) => (
                  <div key={n._id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${n.isRead ? 'bg-gray-50' : 'bg-primary-50'}`}>
                    <div className="mt-0.5">{NOTIF_ICONS[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.isRead ? 'text-gray-500' : 'text-dark font-medium'} leading-snug`}>{n.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No notifications yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
