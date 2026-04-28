import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiUpload, FiArrowLeft, FiUser } from 'react-icons/fi';

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    course: user?.course || '',
    year: user?.year || '',
    bio: user?.bio || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatar(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('college', form.college);
      fd.append('course', form.course);
      fd.append('year', form.year);
      fd.append('bio', form.bio);
      fd.append('location[city]', form.city);
      fd.append('location[state]', form.state);
      if (avatar) fd.append('avatar', avatar);

      const { data } = await API.put('/users/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      toast.success('Profile updated!');
      navigate(`/profile/${user._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-dark text-sm mb-6">
        <FiArrowLeft /> Back
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <FiUser className="text-primary-500 text-xl" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">Edit Profile</h1>
          <p className="text-gray-500 text-sm">Update your information</p>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {preview ? (
                <img src={preview} alt="avatar" className="w-20 h-20 rounded-2xl object-cover shadow" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary-100 text-primary-600 text-3xl font-bold flex items-center justify-center">
                  {user?.name?.charAt(0)}
                </div>
              )}
            </div>
            <label className="btn-secondary cursor-pointer text-sm">
              <FiUpload /> Change Photo
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>

          <div>
            <label className="label">Full Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} className="input" rows={3}
              placeholder="Tell others a bit about yourself..." maxLength={200} />
            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/200</p>
          </div>

          <div>
            <label className="label">College / University</label>
            <input type="text" name="college" value={form.college} onChange={handleChange} className="input" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Course</label>
              <input type="text" name="course" value={form.course} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Year</label>
              <select name="year" value={form.year} onChange={handleChange} className="input">
                <option value="">Select Year</option>
                {['1st Year','2nd Year','3rd Year','4th Year','PG','Other'].map(y => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="input" placeholder="e.g. Kanpur" />
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} className="input" placeholder="e.g. UP" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
