import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import BookCard from '../components/books/BookCard';
import StarRating from '../components/common/StarRating';
import { FiEdit2, FiMessageCircle, FiMapPin, FiBook, FiStar, FiCalendar } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('books');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/users/${id}`);
        setProfile(data.user);
        setBooks(data.books);
        setReviews(data.reviews);
      } catch { navigate('/'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <Spinner fullPage />;
  if (!profile) return null;

  const isMe = user?._id === id;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name}
                className="w-24 h-24 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-md">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-dark">{profile.name}</h1>
                {profile.college && (
                  <p className="text-gray-500 text-sm mt-0.5">🎓 {profile.college}
                    {profile.course && <span className="text-gray-400"> — {profile.course}</span>}
                    {profile.year && <span className="text-gray-400">, {profile.year}</span>}
                  </p>
                )}
                {profile.location?.city && (
                  <p className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                    <FiMapPin className="text-xs" /> {profile.location.city}{profile.location.state && `, ${profile.location.state}`}
                  </p>
                )}
                {profile.rating?.count > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating value={Math.round(profile.rating.average)} readonly size="sm" />
                    <span className="text-sm text-gray-500">
                      {profile.rating.average} ({profile.rating.count} review{profile.rating.count !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {isMe ? (
                  <Link to="/profile/edit" className="btn-secondary text-sm py-2 px-3">
                    <FiEdit2 /> Edit Profile
                  </Link>
                ) : user ? (
                  <Link to={`/chat/${profile._id}`} className="btn-primary text-sm py-2 px-3">
                    <FiMessageCircle /> Message
                  </Link>
                ) : null}
              </div>
            </div>
            {profile.bio && (
              <p className="text-gray-600 text-sm mt-3 bg-gray-50 rounded-xl p-3">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: 'Books Listed', value: books.length, icon: <FiBook className="text-primary-500" /> },
            { label: 'Reviews', value: reviews.length, icon: <FiStar className="text-yellow-400" /> },
            { label: 'Member Since', value: new Date(profile.createdAt).getFullYear(), icon: <FiCalendar className="text-accent-500" /> },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-bold text-xl text-dark">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-card mb-6 w-fit">
        {['books', 'reviews'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:text-dark'
            }`}>
            {t} {t === 'books' ? `(${books.length})` : `(${reviews.length})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'books' ? (
        books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map(book => <BookCard key={book._id} book={book} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <FiBook className="text-5xl mx-auto mb-3" />
            <p>{isMe ? "You haven't listed any books yet." : "No books listed yet."}</p>
            {isMe && <Link to="/add-book" className="btn-primary mt-4 inline-flex">List a Book</Link>}
          </div>
        )
      ) : (
        reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="card p-5">
                <div className="flex items-start gap-3">
                  {review.reviewer?.avatar ? (
                    <img src={review.reviewer.avatar} alt={review.reviewer.name}
                      className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center">
                      {review.reviewer?.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-dark text-sm">{review.reviewer?.name}</p>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <StarRating value={review.rating} readonly size="sm" />
                    {review.comment && <p className="text-gray-600 text-sm mt-2">{review.comment}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <FiStar className="text-5xl mx-auto mb-3" />
            <p>No reviews yet.</p>
          </div>
        )
      )}
    </div>
  );
}
