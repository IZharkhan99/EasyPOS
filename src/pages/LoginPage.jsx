import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const [email, setEmail] = useState('izharkhanfff@gmail.com');
  const [password, setPassword] = useState('admin123');
  const { login, isLoggingIn } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Invalid email or password', 'error');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #131920 100%)' }}>
      <div className="bg-theme-surface border border-theme2 rounded-2xl p-10 w-full max-w-[380px] shadow-[0_20px_60px_rgba(0,0,0,.4)]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#3b82f6] rounded-xl flex items-center justify-center mx-auto mb-4 font-black text-white text-2xl">📱</div>
          <div className="text-xl font-extrabold text-theme mb-1.5">Easy POS</div>
          <div className="text-[13px] text-theme3">Multi-Business Point of Sale</div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme2">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" required
              className="bg-theme-elevated border border-theme2 rounded-[9px] py-[11px] px-[13px] text-[13px] text-theme outline-none transition-all focus:border-[#3b82f6] font-[DM_Sans]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-theme2">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Enter password" required
              className="bg-theme-elevated border border-theme2 rounded-[9px] py-[11px] px-[13px] text-[13px] text-theme outline-none transition-all focus:border-[#3b82f6] font-[DM_Sans]" />
          </div>
          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="bg-[#3b82f6] text-white border-none py-3 rounded-[9px] text-sm font-bold cursor-pointer transition-all mt-2 hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="bg-theme-elevated border border-theme rounded-[9px] p-3 mt-3.5">
          <div className="text-[11px] font-bold text-theme3 uppercase tracking-[.5px] mb-2">Demo Accounts</div>
          <div className="text-xs py-1.5 text-theme2"><strong className="text-theme font-semibold">Email:</strong> admin@shop.com</div>
          <div className="text-xs py-1.5 text-theme2"><strong className="text-theme font-semibold">Password:</strong> admin123</div>
          <div className="text-xs py-1.5 text-theme2 mt-2"><strong className="text-theme font-semibold">or</strong> manager@shop.com / manager123</div>
        </div>
        <div className="text-center mt-5 text-[13px] text-theme2">
          New here? <Link to="/signup" className="text-[#3b82f6] font-bold hover:underline">Create a Business</Link>
        </div>
      </div>
    </div>
  );
}
