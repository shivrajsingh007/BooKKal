import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import StarRating from '../components/common/StarRating';
import toast from 'react-hot-toast';
import { FiMapPin, FiEdit2, FiTrash2, FiMessageCircle, FiRepeat, FiArrowLeft, FiStar } from 'react-icons/fi';

const BADGE = { free: 'badge-free', paid: 'badge-paid', exchange: 'badge-exchange' };
const LABEL = { free: 'Free', paid: 'For Sale', exchange: 'Exchange' };

export default function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExchangeForm, setShowExchangeForm] = useState(false);
  const [exchangeData, setExchangeData] = useState({ offeredBookId: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/books/${id}`);
        setBook(data.book);
        if (user) {
          const res = await API.get('/books/my-books');
          setMyBooks(res.data.books.filter((b) => b.isAvailable && b._id !== id));
        }
      } catch { navigate('/books'); }
      setLoading(false);
    };
    fetch();
  }, [id, user]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await API.delete(`/books/${id}`);
      toast.success('Book deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleExchangeRequest = async (e) => {
    e.preventDefault();
    if (!exchangeData.offeredBookId) return toast.error('Please select a book to offer');
    setSubmitting(true);
    try {
      await API.post('/exchange', {
        requestedBookId: id,
        offeredBookId: exchangeData.offeredBookId,
        message: exchangeData.message,
      });
      toast.success('Exchange request sent!');
      setShowExchangeForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
    setSubmitting(false);
  };

  const handleMessage = () => {
    navigate(`/chat/${book.owner._id}`);
  };

  if (loading) return <Spinner fullPage />;
  if (!book) return null;

  const isOwner = user?._id === book.owner?._id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-dark text-sm mb-6 transition-colors">
        <FiArrowLeft /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="card overflow-hidden">
          {book.image ? (
            <img src={book.image} alt={book.title} className="w-full h-80 object-cover" />
          ) : (
            <div className="w-full h-80 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-8xl">📚</div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className={BADGE[book.listingType]}>{LABEL[book.listingType]}</span>
            {!book.isAvailable && <span className="badge-rejected">Not Available</span>}
          </div>

          <h1 className="font-display text-3xl font-bold text-dark mb-1">{book.title}</h1>
          <p className="text-gray-500 mb-4">by <span className="text-dark font-medium">{book.author}</span></p>

          {book.listingType === 'paid' && (
            <p className="text-3xl font-bold text-primary-600 mb-4">₹{book.price}</p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Condition</p>
              <p className="font-semibold text-dark">{book.condition}</p>
            </div>
            {book.subject && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">Subject</p>
                <p className="font-semibold text-dark truncate">{book.subject}</p>
              </div>
            )}
          </div>

          {book.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-5 bg-gray-50 rounded-xl p-4">{book.description}</p>
          )}

          {/* Owner Card */}
          <Link to={`/profile/${book.owner._id}`} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors mb-5">
            {book.owner.avatar ? (
              <img src={book.owner.avatar} alt={book.owner.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 text-lg font-bold flex items-center justify-center">
                {book.owner.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-dark">{book.owner.name}</p>
              <p className="text-xs text-gray-400">{book.owner.college}</p>
              {book.owner.rating?.count > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <StarRating value={Math.round(book.owner.rating.average)} readonly size="sm" />
                  <span className="text-xs text-gray-400">({book.owner.rating.count})</span>
                </div>
              )}
            </div>
            {book.location?.city && (
              <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                <FiMapPin /> {book.location.city}
              </div>
            )}
          </Link>

          {/* Actions */}
          {isOwner ? (
            <div className="flex gap-3">
              <Link to={`/edit-book/${book._id}`} className="btn-secondary flex-1 justify-center">
                <FiEdit2 /> Edit Book
              </Link>
              <button onClick={handleDelete} className="btn-danger flex-1 justify-center">
                <FiTrash2 /> Delete
              </button>
            </div>
          ) : user && book.isAvailable ? (
            <div className="space-y-3">
              <button onClick={handleMessage} className="w-full btn-secondary justify-center">
                <FiMessageCircle /> Message Seller
              </button>
              {book.listingType === 'exchange' && (
                <button onClick={() => setShowExchangeForm(!showExchangeForm)} className="w-full btn-primary justify-center">
                  <FiRepeat /> Request Exchange
                </button>
              )}
            </div>
          ) : !user ? (
            <Link to="/login" className="w-full btn-primary justify-center block text-center">
              Log in to Contact Seller
            </Link>
          ) : null}

          {/* Exchange Form */}
          {showExchangeForm && (
            <form onSubmit={handleExchangeRequest} className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <h3 className="font-semibold text-dark mb-3">Choose a book to offer</h3>
              {myBooks.length > 0 ? (
                <>
                  <select value={exchangeData.offeredBookId}
                    onChange={(e) => setExchangeData({ ...exchangeData, offeredBookId: e.target.value })}
                    className="input mb-3" required>
                    <option value="">Select your book</option>
                    {myBooks.map((b) => (
                      <option key={b._id} value={b._id}>{b.title} — {b.condition}</option>
                    ))}
                  </select>
                  <textarea value={exchangeData.message}
                    onChange={(e) => setExchangeData({ ...exchangeData, message: e.target.value })}
                    className="input mb-3" rows={2} placeholder="Optional message to the owner..." />
                  <button type="submit" disabled={submitting} className="w-full btn-primary justify-center">
                    {submitting ? 'Sending...' : 'Send Exchange Request'}
                  </button>
                </>
              ) : (
                <p className="text-sm text-gray-500">You have no available books to offer. <Link to="/add-book" className="text-primary-500 underline">Add one first</Link>.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
