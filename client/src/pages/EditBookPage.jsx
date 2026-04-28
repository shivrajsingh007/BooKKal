import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiUpload, FiArrowLeft } from 'react-icons/fi';
import Spinner from '../components/common/Spinner';

export default function EditBookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', author: '', description: '', condition: '', listingType: 'paid', price: '', subject: '', genre: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/books/${id}`);
        const b = data.book;
        setForm({
          title: b.title, author: b.author, description: b.description,
          condition: b.condition, listingType: b.listingType, price: b.price,
          subject: b.subject, genre: b.genre,
        });
        if (b.image) setPreview(b.image);
      } catch { navigate('/dashboard'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      await API.put(`/books/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Book updated!');
      navigate(`/books/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setSubmitting(false);
  };

  if (loading) return <Spinner fullPage />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-dark text-sm mb-6">
        <FiArrowLeft /> Back
      </button>
      <h1 className="font-display text-2xl font-bold text-dark mb-6">Edit Book</h1>
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Book Image</label>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:border-primary-300 transition-all">
              {preview ? (
                <img src={preview} alt="Preview" className="h-40 object-contain rounded-lg" />
              ) : (
                <>
                  <FiUpload className="text-3xl text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Click to change image</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          </div>

          <div>
            <label className="label">Book Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label className="label">Author *</label>
            <input type="text" name="author" value={form.author} onChange={handleChange} className="input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Subject</label>
              <input type="text" name="subject" value={form.subject} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Genre</label>
              <input type="text" name="genre" value={form.genre} onChange={handleChange} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Condition *</label>
              <select name="condition" value={form.condition} onChange={handleChange} className="input" required>
                <option value="">Select</option>
                {['Like New', 'Good', 'Fair', 'Poor'].map(c => <option key={c}>{c}</option>)}
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
              <label className="label">Price (₹)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} className="input" min="0" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
