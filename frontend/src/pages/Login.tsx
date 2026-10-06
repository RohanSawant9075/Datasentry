import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

export function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = isRegister
        ? await authService.register(formData)
        : await authService.login(formData);

      setAuth(response.user, response.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-deep via-brand-secondary to-brand-primary animate-gradient" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-brand-muted/20 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl"
        animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="p-4 bg-brand-primary/30 rounded-card"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring' }}
          >
            <Shield className="w-12 h-12 text-brand-pink" />
          </motion.div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gradient">
            DataSentry-AI
          </h1>
          <p className="text-text-secondary text-sm">
            Trust Your Data. Confident Decisions.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-status-critical/20 border border-status-critical/30 text-status-critical px-4 py-3 rounded-button mb-6 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input pl-11"
                  placeholder="John Analyst"
                  required={isRegister}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input pl-11"
                placeholder="analyst@datasentry.ai"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input pl-11"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isRegister ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-sm text-text-secondary hover:text-brand-pink transition-colors"
          >
            {isRegister ? (
              <>
                Already have an account?{' '}
                <span className="font-medium text-brand-pink">Sign in</span>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <span className="font-medium text-brand-pink">Register</span>
              </>
            )}
          </button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-text-muted text-center">
            Demo: analyst@datasentry.ai / demo123
          </p>
        </div>
      </motion.div>
    </div>
  );
}
