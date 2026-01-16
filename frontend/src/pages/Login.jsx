import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Login = () => {
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/send-otp', { email });
      console.log("login url :",api)
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, otp);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl mb-4 animate-bounce-in shadow-lg">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 animate-slide-up">Welcome to TeamSync</h1>
          <p className="text-gray-600 animate-slide-up">
            {step === 'email' ? 'Enter your email to get started' : 'Enter the OTP sent to your email'}
          </p>
        </div>

        <div className="card animate-slide-up shadow-xl">{step === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send OTP →</span>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                We'll send a one-time password to your email. No passwords to remember! 🎉
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-Digit OTP
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input pl-10 text-center text-2xl tracking-widest font-bold"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Sent to: <span className="font-medium text-gray-700">{email}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Login →</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                }}
                className="btn-secondary w-full"
              >
                ← Change Email
              </button>

              <p className="text-xs text-center text-gray-500">
                OTP expires in 10 minutes. Didn't receive it? Check spam or resend.
              </p>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 animate-fade-in">
          <p>🔒 Secure OTP-based authentication</p>
          <p className="mt-1">No passwords. No JWT in browser. ✓</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
