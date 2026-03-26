import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getDAL } from '../services/dal';

const dal = getDAL();

export default function OnboardingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dal.createBusinessAndProfile(email, password, businessName, fullName);
      showToast('Business account created! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #131920 100%)' }}>
      <div className="bg-theme-surface border border-theme2 rounded-2xl p-8 w-full max-w-[420px] shadow-[0_20px_60px_rgba(0,0,0,.4)]">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#22c55e] rounded-xl flex items-center justify-center mx-auto mb-4 font-black text-white text-2xl">🚀</div>
          <div className="text-xl font-extrabold text-theme mb-1.5">Get Started with Easy POS</div>
          <div className="text-[13px] text-theme3">Create your business account in seconds</div>
        </div>
        <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme2">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} type="text" placeholder="John Doe" required
              className="bg-theme-elevated border border-theme2 rounded-[9px] py-[10px] px-[13px] text-[13px] text-theme outline-none transition-all focus:border-[#22c55e] font-[DM_Sans]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme2">Business Name</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} type="text" placeholder="Ahmed Electronics" required
              className="bg-theme-elevated border border-theme2 rounded-[9px] py-[10px] px-[13px] text-[13px] text-theme outline-none transition-all focus:border-[#22c55e] font-[DM_Sans]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme2">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" required
              className="bg-theme-elevated border border-theme2 rounded-[9px] py-[10px] px-[13px] text-[13px] text-theme outline-none transition-all focus:border-[#22c55e] font-[DM_Sans]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme2">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Min 6 characters" minLength="6" required
              className="bg-theme-elevated border border-theme2 rounded-[9px] py-[10px] px-[13px] text-[13px] text-theme outline-none transition-all focus:border-[#22c55e] font-[DM_Sans]" />
          </div>
          <button type="submit" disabled={loading} className="bg-[#22c55e] text-white border-none py-3 rounded-[9px] text-sm font-bold cursor-pointer transition-all mt-2 hover:bg-[#16a34a] disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Business'}
          </button>
        </form>
        <div className="text-center mt-5 text-[13px] text-theme2">
          Already have an account? <Link to="/login" className="text-[#3b82f6] font-bold hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
