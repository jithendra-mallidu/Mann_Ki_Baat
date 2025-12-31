import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { authApi } from '../../services/api';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Register first, then login
        await authApi.register(email, password, name || undefined);
        await authApi.login(email, password);
      } else {
        await authApi.login(email, password);
      }
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    const response = await authApi.forgotPassword(email);
    // In development mode, the token will be returned in the response
    if (response.reset_token) {
      console.log('Password reset token (dev mode):', response.reset_token);
      console.log('Reset URL (dev mode):', `${window.location.origin}/reset-password?token=${response.reset_token}`);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Dark Background with Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#2d2a2e] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-md">
          <div className="text-white/60 mb-8 text-sm">
            Organize your thoughts, one note at a time
          </div>
          <h1 className="text-white text-5xl mb-8">
            Manage
            <br />
            your notes
          </h1>
          <div className="mt-16 relative">
            <div className="bg-[#1e1e1e] rounded-lg p-6 shadow-2xl">
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - White Background with Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo and Sign Up/In Toggle */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-xl font-semibold">NoteKeeper</span>
            </div>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <span className="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center text-xs">
                {isSignUp ? '←' : '+'}
              </span>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {/* Sign In/Up Form */}
          <div>
            <h2 className="text-3xl mb-8">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div>
                  <Input
                    type="text"
                    placeholder="Name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-12"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-orange-500 hover:text-orange-600"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl disabled:opacity-50"
              >
                {isLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>

            <div className="mt-12 text-center text-xs text-gray-400">
              © 2005-2025 NoteKeeper Inc.
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSubmit={handleForgotPassword}
      />
    </div>
  );
}
