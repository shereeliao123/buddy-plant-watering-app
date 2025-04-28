import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupCooldown, setSignupCooldown] = useState(0);
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (signupCooldown > 0) {
      timer = setInterval(() => {
        setSignupCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signupCooldown]);

  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (signupCooldown > 0) {
          throw new Error(`Please wait ${signupCooldown} seconds before trying to sign up again`);
        }
        await signUp(email, password);
        setSignupCooldown(30); // Set 30-second cooldown after signup attempt
        setError('Please check your email for a confirmation link before signing in');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Handle specific error cases
      if (errorMessage.includes('email_not_confirmed')) {
        setError('Please confirm your email address before signing in. Check your inbox for the confirmation link.');
      } else if (errorMessage.includes('over_email_send_rate_limit')) {
        setError('Too many signup attempts. Please wait a moment before trying again.');
        setSignupCooldown(30);
      } else if (errorMessage.includes('user_already_exists') || errorMessage.includes('User already registered')) {
        setError('This email is already registered. Please sign in instead.');
        setIsSignUp(false); // Switch to sign in mode
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonDisabled = loading || (isSignUp && signupCooldown > 0);
  const buttonText = loading 
    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
    : isSignUp 
      ? signupCooldown > 0 
        ? `Wait ${signupCooldown}s` 
        : 'Sign up'
      : 'Sign in';

  return (
    <div className="min-h-screen bg-buddy-pink flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <img src="/fauget.png" alt="Logo" className="h-24 w-24" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-buddy-brown">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp
              ? 'Start tracking your plants today'
              : 'Sign in to manage your plants'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`p-3 rounded-md text-sm ${
              error.includes('check your email') || error.includes('confirm your email')
                ? 'bg-blue-50 text-blue-600'
                : error.includes('already registered')
                ? 'bg-yellow-50 text-yellow-600'
                : 'bg-red-50 text-red-600'
            }`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-buddy-brown">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-buddy-brown/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-buddy-green focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-buddy-brown">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-buddy-brown/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-buddy-green focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={buttonDisabled}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-buddy-green hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-buddy-green ${
              buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {buttonText}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-buddy-brown hover:text-buddy-green"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;