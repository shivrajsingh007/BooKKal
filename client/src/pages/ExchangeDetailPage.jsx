import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import StarRating from '../components/common/StarRating';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiRepeat, FiMessageCircle, FiCheck, FiX, FiStar } from 'react-icons/fi';
import { format } from 'date-fns';

const STATUS_BADGE = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  rejected: 'badge-rejected',
  cancelled: 'bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full',
  completed: 'bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full',
};

export default function ExchangeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [ownerNote, setOwnerNote] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/exchange/${id}`);
        setExchange(data.exchange);
      } catch { navigate('/exchanges'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleStatus = async (status) => {
    setActionLoading(true);
    try {
      const { data } = await API.put(`/exchange/${id}/status`, { status, ownerNote });
      setExchange(data.exchange);
      toast.success(`Exchange ${status}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
    setActionLoading(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this exchange request?')) return;
    setActionLoading(true);
    try {
      const { data } = await API.put(`/exchange/${id}/cancel`);
      setExchange(data.exchange);
      toast.success('Exchange cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
    setActionLoading(false);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!review.rating) return toast.error('Please select a rating');
    setReviewSubmitting(true);
    try {
      await API.post('/reviews', { exchangeId: id, rating: review.rating, comment: review.comment });
      toast.success('Review submitted!');
      setShowReviewForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setReviewSubmitting(false);
  };

  if (loading) return <Spinner fullPage />;
  if (!exchange) return null;

  const isOwner = user._id === exchange.owner._id;
  const isRequester = user._id === exchange.requester._id;
  const otherUser = isOwner ? exchange.requester : exchange.owner;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/exchanges')}
        className="flex items-center gap-1 text-gray-500 hover:text-dark text-sm mb-6 transition-colors">
        <FiArrowLeft /> Back to Exchanges
      </button>

      {/* Status Banner */}
      <div className={`rounded-2xl p-4 mb-6 flex items-center justify-between ${
        exchange.status === 'accepted' ? 'bg-green-50 border border-green-100' :
        exchange.status === 'rejected' ? 'bg-red-50 border border-red-100' :
        exchange.status === 'pending' ? 'bg-yellow-50 border border-yellow-100' :
        'bg-gray-50 border border-gray-100'
      }`}>
        <div>
          <p className="text-sm font-medium text-dark mb-1">Exchange Request</p>
          <span className={STATUS_BADGE[exchange.status]}>{exchange.status}</span>
        </div>
        <p className="text-xs text-gray-400">{format(new Date(exchange.createdAt), 'MMM d, yyyy')}</p>
      </div>

      {/* Books */}
      <div className="card p-6 mb-5">
        <h2 className="font-display font-bold text-lg text-dark mb-5">Exchange Details</h2>
        <div className="flex items-center gap-4">
          {/* Offered Book */}
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Offered by {exchange.requester.name}</p>
            <Link to={`/books/${exchange.offeredBook._id}`}>
              <div className="h-32 rounded-xl overflow-hidden bg-gray-100 mx-auto max-w-[120px] hover:shadow-md transition-shadow">
                {exchange.offeredBook.image ? (
                  <img src={exchange.offeredBook.image} alt={exchange.offeredBook.title}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                )}
              </div>
              <p className="text-sm font-semibold text-dark mt-2 line-clamp-2">{exchange.offeredBook.title}</p>
              <p className="text-xs text-gray-400">{exchange.offeredBook.condition}</p>
            </Link>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <FiRepeat className="text-2xl text-gray-300" />
            <span className="text-xs text-gray-300">swap</span>
          </div>

          {/* Requested Book */}
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Owned by {exchange.owner.name}</p>
            <Link to={`/books/${exchange.requestedBook._id}`}>
              <div className="h-32 rounded-xl overflow-hidden bg-gray-100 mx-auto max-w-[120px] hover:shadow-md transition-shadow">
                {exchange.requestedBook.image ? (
                  <img src={exchange.requestedBook.image} alt={exchange.requestedBook.title}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                )}
              </div>
              <p className="text-sm font-semibold text-dark mt-2 line-clamp-2">{exchange.requestedBook.title}</p>
              <p className="text-xs text-gray-400">{exchange.requestedBook.condition}</p>
            </Link>
          </div>
        </div>

        {exchange.message && (
          <div className="mt-5 p-4 bg-gray-50 rounded-xl border-l-4 border-primary-400">
            <p className="text-xs text-gray-400 mb-1">Message from {exchange.requester.name}</p>
            <p className="text-sm text-gray-700">{exchange.message}</p>
          </div>
        )}

        {exchange.ownerNote && (
          <div className="mt-3 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400">
            <p className="text-xs text-gray-400 mb-1">Note from {exchange.owner.name}</p>
            <p className="text-sm text-gray-700">{exchange.ownerNote}</p>
          </div>
        )}
      </div>

      {/* Users */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          { label: 'Requester', person: exchange.requester },
          { label: 'Owner', person: exchange.owner },
        ].map(({ label, person }) => (
          <Link key={label} to={`/profile/${person._id}`}
            className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
            {person.avatar ? (
              <img src={person.avatar} alt={person.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center">
                {person.name?.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-semibold text-sm text-dark truncate">{person.name}</p>
              <p className="text-xs text-gray-400 truncate">{person.college}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Owner can accept/reject pending */}
        {isOwner && exchange.status === 'pending' && (
          <div className="card p-5">
            <p className="text-sm font-medium text-dark mb-3">Respond to this request</p>
            <textarea value={ownerNote} onChange={(e) => setOwnerNote(e.target.value)}
              className="input mb-3" rows={2} placeholder="Optional note to the requester..." />
            <div className="flex gap-3">
              <button onClick={() => handleStatus('rejected')} disabled={actionLoading}
                className="btn-danger flex-1 justify-center">
                <FiX /> Decline
              </button>
              <button onClick={() => handleStatus('accepted')} disabled={actionLoading}
                className="btn-primary flex-1 justify-center bg-green-500 hover:bg-green-600">
                <FiCheck /> Accept
              </button>
            </div>
          </div>
        )}

        {/* Requester can cancel pending */}
        {isRequester && exchange.status === 'pending' && (
          <button onClick={handleCancel} disabled={actionLoading}
            className="w-full btn-secondary justify-center text-red-500 border-red-200 hover:bg-red-50">
            <FiX /> Cancel Request
          </button>
        )}

        {/* Message other user */}
        <Link to={`/chat/${otherUser._id}`} className="w-full btn-secondary justify-center block text-center">
          <FiMessageCircle /> Message {otherUser.name}
        </Link>

        {/* Leave review after accepted */}
        {exchange.status === 'accepted' && (
          <button onClick={() => setShowReviewForm(!showReviewForm)}
            className="w-full btn-primary justify-center">
            <FiStar /> Leave a Review
          </button>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleReview} className="card p-5">
            <h3 className="font-display font-bold text-dark mb-4">Rate {otherUser.name}</h3>
            <div className="mb-4">
              <label className="label">Rating *</label>
              <StarRating value={review.rating} onChange={(r) => setReview({ ...review, rating: r })} size="lg" />
            </div>
            <div className="mb-4">
              <label className="label">Comment</label>
              <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })}
                className="input" rows={3} placeholder="Share your experience..." maxLength={300} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowReviewForm(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button type="submit" disabled={reviewSubmitting} className="btn-primary flex-1 justify-center">
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
