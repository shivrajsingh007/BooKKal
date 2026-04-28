import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiUpload, FiArrowLeft, FiBook } from 'react-icons/fi';

export default function AddBookPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', author: '', description: '', condition: '', listingType: 'paid', price: '', subject: '', genre: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.condition) return toast.error('Please select book condition');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);

      await API.post('/books', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Book listed successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add book');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-dark text-sm mb-6">
        <FiArrowLeft /> Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <FiBook className="text-primary-500 text-xl" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">List a Book</h1>
          <p className="text-gray-500 text-sm">Fill in the details to list your book</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div>
            <label className="label">Book Image</label>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all group">
              {preview ? (
                <img src={preview} alt="Preview" className="h-40 object-contain rounded-lg" />
              ) : (
                <>
                  <FiUpload className="text-3xl text-gray-300 group-hover:text-primary-400 mb-2" />
                  <p className="text-sm text-gray-400">Click to upload image</p>
                  <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP up to 5MB</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="label">Book Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange}
                className="input" placeholder="e.g. Engineering Mathematics Vol.2" required />
            </div>
            <div>
              <label className="label">Author *</label>
              <input type="text" name="author" value={form.author} onChange={handleChange}
                className="input" placeholder="e.g. R.D. Sharma" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Subject</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange}
                className="input" placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="label">Genre</label>
              <input type="text" name="genre" value={form.genre} onChange={handleChange}
                className="input" placeholder="e.g. Engineering" />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className="input" rows={3} placeholder="Any notes about the book, edition, etc." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Condition *</label>
              <select name="condition" value={form.condition} onChange={handleChange} className="input" required>
                <option value="">Select condition</option>
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
            <div>
              <label className="label">Listing Type *</label>
              <select name="listingType" value={form.listingType} onChange={handleChange} className="input">
                <option value="paid">For Sale</option>
                <option value="free">Free</option>
                <option value="exchange">Exchange</option>
              </select>
            </div>
          </div>

          {form.listingType === 'paid' && (
            <div>
              <label className="label">Price (₹) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange}
                className="input" placeholder="e.g. 150" min="0" required />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Listing...' : 'List Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
