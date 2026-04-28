import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import BookCard from '../components/books/BookCard';
import Spinner from '../components/common/Spinner';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    listingType: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
  });

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('limit', '12');

      const { data } = await API.get(`/books?${params.toString()}`);
      setBooks(data.books);
      setTotal(data.total);
      setPages(data.pages);
    } catch {}
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', listingType: '', condition: '', minPrice: '', maxPrice: '', page: 1 });
    setSearchParams({});
  };

  const hasActiveFilter = filters.listingType || filters.condition || filters.minPrice || filters.maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-dark mb-1">Browse Books</h1>
        <p className="text-gray-500 text-sm">{total} books available</p>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilter('search', e.target.value)}
            placeholder="Search by title, author, subject..."
            className="input pl-10"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary gap-2 ${hasActiveFilter ? 'border-primary-400 text-primary-500' : ''}`}>
          <FiFilter /> Filters {hasActiveFilter && <span className="bg-primary-500 text-white text-xs px-1.5 rounded-full">!</span>}
        </button>
        {hasActiveFilter && (
          <button onClick={clearFilters} className="btn-secondary gap-1 text-red-500 border-red-200">
            <FiX /> Clear
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Listing Type</label>
            <select value={filters.listingType} onChange={(e) => handleFilter('listingType', e.target.value)} className="input">
              <option value="">All Types</option>
              <option value="free">Free</option>
              <option value="paid">For Sale</option>
              <option value="exchange">Exchange</option>
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select value={filters.condition} onChange={(e) => handleFilter('condition', e.target.value)} className="input">
              <option value="">All Conditions</option>
              <option>Like New</option>
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </div>
          <div>
            <label className="label">Min Price (₹)</label>
            <input type="number" value={filters.minPrice} onChange={(e) => handleFilter('minPrice', e.target.value)}
              className="input" placeholder="0" min="0" />
          </div>
          <div>
            <label className="label">Max Price (₹)</label>
            <input type="number" value={filters.maxPrice} onChange={(e) => handleFilter('maxPrice', e.target.value)}
              className="input" placeholder="9999" min="0" />
          </div>
        </div>
      )}

      {/* Quick Filter Chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[
          { label: '🆓 Free Books', value: 'free', key: 'listingType' },
          { label: '🔄 Exchange', value: 'exchange', key: 'listingType' },
          { label: '💰 For Sale', value: 'paid', key: 'listingType' },
          { label: '✨ Like New', value: 'Like New', key: 'condition' },
        ].map((chip) => (
          <button key={chip.label}
            onClick={() => handleFilter(chip.key, filters[chip.key] === chip.value ? '' : chip.value)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
              filters[chip.key] === chip.value
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            }`}>
            {chip.label}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {loading ? (
        <Spinner />
      ) : books.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {books.map((book) => <BookCard key={book._id} book={book} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => handleFilter('page', filters.page - 1)} disabled={filters.page === 1}
                className="btn-secondary py-2 px-3 disabled:opacity-40">
                <FiChevronLeft />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => handleFilter('page', p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === filters.page ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => handleFilter('page', filters.page + 1)} disabled={filters.page === pages}
                className="btn-secondary py-2 px-3 disabled:opacity-40">
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <span className="text-6xl block mb-4">📚</span>
          <p className="text-lg font-medium mb-2">No books found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
