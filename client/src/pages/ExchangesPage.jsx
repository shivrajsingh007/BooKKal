import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import Spinner from '../components/common/Spinner';
import { FiRepeat, FiArrowRight } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const STATUS_BADGE = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  rejected: 'badge-rejected',
  cancelled: 'bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full',
  completed: 'bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full',
};

export default function ExchangesPage() {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/exchange');
        setExchanges(data.exchanges);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = tab === 'all' ? exchanges
    : tab === 'sent' ? exchanges.filter(e => e.requester?._id !== undefined && tab === 'sent')
    : exchanges;

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const tabFiltered = tab === 'all' ? exchanges : exchanges.filter(e => e.status === tab);

  if (loading) return <Spinner fullPage />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <FiRepeat className="text-purple-500 text-xl" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">Book Exchanges</h1>
          <p className="text-gray-500 text-sm">Manage your exchange requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-card mb-6 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:text-dark'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tabFiltered.length > 0 ? (
        <div className="space-y-4">
          {tabFiltered.map(ex => (
            <Link key={ex._id} to={`/exchanges/${ex._id}`}
              className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow group">
              {/* Books thumbnails */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {ex.offeredBook?.image ? (
                    <img src={ex.offeredBook.image} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-xl">📚</div>}
                </div>
                <FiRepeat className="text-gray-300 text-lg flex-shrink-0" />
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {ex.requestedBook?.image ? (
                    <img src={ex.requestedBook.image} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-xl">📚</div>}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={STATUS_BADGE[ex.status]}>{ex.status}</span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(ex.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium text-dark truncate">
                  <span className="text-gray-400">Offered:</span> {ex.offeredBook?.title}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  <span className="text-gray-400">For:</span> {ex.requestedBook?.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    {ex.requester?.avatar ? (
                      <img src={ex.requester.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center">
                        {ex.requester?.name?.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{ex.requester?.name}</span>
                  </div>
                  <span className="text-gray-300">↔</span>
                  <div className="flex items-center gap-1.5">
                    {ex.owner?.avatar ? (
                      <img src={ex.owner.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-accent-100 text-accent-600 text-xs font-bold flex items-center justify-center">
                        {ex.owner?.name?.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{ex.owner?.name}</span>
                  </div>
                </div>
              </div>

              <FiArrowRight className="text-gray-300 group-hover:text-primary-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <FiRepeat className="text-5xl mx-auto mb-4" />
          <p className="font-medium mb-1">No exchanges found</p>
          <p className="text-sm">Browse books and request an exchange!</p>
          <Link to="/books" className="btn-primary mt-6 inline-flex">Browse Books</Link>
        </div>
      )}
    </div>
  );
}
