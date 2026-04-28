import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiRepeat, FiGift, FiShoppingTag, FiArrowRight, FiSearch } from 'react-icons/fi';
import API from '../utils/api';
import BookCard from '../components/books/BookCard';
import Spinner from '../components/common/Spinner';

export default function HomePage() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await API.get('/books?limit=8');
        setFeaturedBooks(data.books);
        setStats({ total: data.total });
      } catch {}
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) window.location.href = `/books?search=${encodeURIComponent(search)}`;
  };

  const features = [
    { icon: <FiGift className="text-3xl text-accent-500" />, title: 'Give for Free', desc: 'Share books you no longer need with fellow students.', color: 'bg-accent-50' },
    { icon: <FiShoppingTag className="text-3xl text-primary-500" />, title: 'Sell Books', desc: 'Make some money from your old textbooks.', color: 'bg-primary-50' },
    { icon: <FiRepeat className="text-3xl text-purple-500" />, title: 'Barter & Exchange', desc: 'Trade your book for one you actually need.', color: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark via-[#2d2d44] to-dark py-24 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/20">
            <FiBook /> {stats.total > 0 ? `${stats.total}+ books listed` : 'Student book exchange'}
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Exchange Books,<br />
            <span className="text-primary-400">Share Knowledge</span>
          </h1>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto font-body">
            Buy, sell, or exchange second-hand books with students across your campus. Save money. Help others. Build community.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author, subject..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary-400 text-dark font-body"
              />
            </div>
            <button type="submit" className="btn-primary py-3 px-6 rounded-xl">Search</button>
          </form>

          <div className="flex justify-center gap-6 mt-8">
            <Link to="/register" className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors">
              Get Started Free <FiArrowRight />
            </Link>
            <Link to="/books" className="text-white/80 hover:text-white text-sm transition-colors">
              Browse Books →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-dark mb-10">How BookKal Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`${f.color} p-6 rounded-2xl`}>
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-xl mb-2 text-dark">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold text-dark">Recently Listed</h2>
            <Link to="/books" className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1">
              View All <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <Spinner />
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <FiBook className="text-5xl mx-auto mb-3" />
              <p>No books listed yet. Be the first!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Ready to clear your shelf?</h2>
          <p className="text-primary-100 mb-8">Join thousands of students exchanging books on BookKal</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Join for Free
            </Link>
            <Link to="/add-book" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              List a Book
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white/60 py-8 px-4 text-center text-sm">
        <p>© 2024 BookKal — Built with ❤️ for students everywhere</p>
      </footer>
    </div>
  );
}
