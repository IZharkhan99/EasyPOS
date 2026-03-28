import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../context/AppContext';
import createLogger from '../utils/logger';

const logger = createLogger('LoginPage');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggingIn } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      logger.info('Attempting login', { email });
      await login({ email, password });
      logger.info('Login successful', { email });
      navigate('/');
    } catch (err) {
      logger.error('Login failed', { email, error: err.message });
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
        <div className="bg-theme-elevated border border-theme rounded-[9px] p-4 mt-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#3b82f61a] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-[#3b82f6]" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          </div>
          <div className="text-[11px] font-medium text-theme3 leading-relaxed">
            Please use the credentials provided during your business registration.
          </div>
        </div>
        <div className="text-center mt-5 text-[13px] text-theme2">
          New here? <Link to="/signup" className="text-[#3b82f6] font-bold hover:underline">Create a Business</Link>
        </div>
      </div>
    </div>
  );
}
