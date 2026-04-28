import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiBook, FiUser, FiMail, FiLock } from 'react-icons/fi';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', course: '', year: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to BookKal 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <FiBook className="text-white text-xl" />
            </div>
            <span className="font-display font-bold text-2xl text-dark">Book<span className="text-primary-500">Kal</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-dark">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join the student book community</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  className="input pl-10" placeholder="Your name" required />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="input pl-10" placeholder="you@college.edu" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  className="input pl-10" placeholder="Min 6 characters" required />
              </div>
            </div>

            <div>
              <label className="label">College / University</label>
              <input type="text" name="college" value={form.college} onChange={handleChange}
                className="input" placeholder="e.g. IIT Delhi" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Course</label>
                <input type="text" name="course" value={form.course} onChange={handleChange}
                  className="input" placeholder="e.g. B.Tech CSE" />
              </div>
              <div>
                <label className="label">Year</label>
                <select name="year" value={form.year} onChange={handleChange} className="input">
                  <option value="">Select Year</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>PG</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
