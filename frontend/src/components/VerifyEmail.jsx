import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, User } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const { fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Invalid link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/users/verify-email/?token=${token}`);
        if (res.data.success) {
          setStatus('success');
          setMessage(res.data.msg || 'Your account has been successfully verified!');
          // Attempt to refresh user profile to update badge if logged in
          await fetchUserProfile();
        } else {
          setStatus('error');
          setMessage(res.data.msg || 'Verification failed. The link might be expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.msg || 'An error occurred during verification.');
      }
    };

    verify();
  }, [token, fetchUserProfile]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Account</h2>
            <p className="text-gray-500">Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Successful</h2>
            <p className="text-gray-500 mb-8">{message}</p>
            <div className="flex gap-3 w-full">
              <Link to="/" className="flex-1 btn-outline flex justify-center items-center gap-2">
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link to="/profile" className="flex-1 btn-primary flex justify-center items-center gap-2">
                <User className="w-4 h-4" /> Profile
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-8">{message}</p>
            <Link to="/profile" className="w-full btn-primary flex justify-center items-center gap-2">
              <User className="w-4 h-4" /> Go to Profile
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
