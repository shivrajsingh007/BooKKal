import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiEye } from 'react-icons/fi';

const BADGE = {
  free: 'badge-free',
  paid: 'badge-paid',
  exchange: 'badge-exchange',
};

const LABEL = { free: 'Free', paid: 'For Sale', exchange: 'Exchange' };

const CONDITION_COLOR = {
  'Like New': 'text-green-600',
  Good: 'text-blue-600',
  Fair: 'text-yellow-600',
  Poor: 'text-red-500',
};

export default function BookCard({ book }) {
  const imageUrl = book.image
    ? book.image.startsWith('/uploads') ? book.image : book.image
    : null;

  return (
    <Link to={`/books/${book._id}`} className="card block overflow-hidden group">
      {/* Image */}
      <div className="h-44 bg-gray-100 overflow-hidden relative">
        {imageUrl ? (
          <img src={imageUrl} alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <span className="text-5xl">📚</span>
          </div>
        )}
        <span className={`absolute top-3 left-3 ${BADGE[book.listingType]}`}>
          {LABEL[book.listingType]}
        </span>
        {!book.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Not Available</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-dark text-base leading-snug line-clamp-1 group-hover:text-primary-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">by {book.author}</p>

        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs font-medium ${CONDITION_COLOR[book.condition]}`}>
            {book.condition}
          </span>
          {book.listingType === 'paid' && (
            <span className="font-bold text-primary-600 text-base">₹{book.price}</span>
          )}
        </div>

        {book.owner && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              {book.owner.avatar ? (
                <img src={book.owner.avatar} alt={book.owner.name} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold">
                  {book.owner.name?.charAt(0)}
                </div>
              )}
              <span className="text-xs text-gray-500 truncate max-w-[80px]">{book.owner.name}</span>
              {book.owner.rating?.count > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-yellow-500">
                  <FiStar className="fill-current" /> {book.owner.rating.average}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FiEye />
              <span>{book.views || 0}</span>
              {book.location?.city && (
                <>
                  <FiMapPin className="ml-1" />
                  <span className="truncate max-w-[60px]">{book.location.city}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
