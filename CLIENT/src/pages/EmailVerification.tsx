import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiCheck, FiAlertCircle, FiMail } from 'react-icons/fi';
import authService from '../services/authService';
import Loader from '../components/UI/Loader/loader-15';

const EmailVerification = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      // Validate token exists
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        // Add a small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await authService.verifyEmail(token);
        
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { state: { verified: true } });
        }, 3000);
      } catch (error: any) {
        console.error('Verification error:', error);
        setStatus('error');
        
        // More specific error messages
        const errorMsg = error.response?.data?.message;
        if (errorMsg?.includes('expired')) {
          setMessage('This verification link has expired. Please request a new one.');
        } else if (errorMsg?.includes('already verified')) {
          setMessage('This email is already verified. You can log in now.');
        } else if (errorMsg?.includes('Invalid')) {
          setMessage('Invalid verification link. Please check your email and try again.');
        } else {
          setMessage(errorMsg || 'Verification failed. Please try again or contact support.');
        }
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0FFF4] via-[#FEFCF8] to-[#F7FEF9]">
        <div className="text-center">
          <Loader />
          <p className="text-gray-600 text-lg animate-pulse mt-4">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0FFF4] via-[#FEFCF8] to-[#F7FEF9] px-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-[#7ADAA5]/20 p-8 border-2 border-[#7ADAA5]/20 animate-[fadeIn_0.5s_ease-in]">
        {status === 'success' ? (
          <>
            {/* Success State */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#7ADAA5] to-[#98D8C8] rounded-full mb-6 animate-[bounce_1s_ease-in-out]">
                <FiCheck className="w-10 h-10 text-white animate-[scaleIn_0.5s_ease-in]" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] bg-clip-text text-transparent mb-3 animate-[slideUp_0.6s_ease-out]">Email Verified!</h1>
              <p className="text-gray-600 mb-6 animate-[fadeIn_0.8s_ease-in]">
                {message}
              </p>
              <div className="p-4 bg-gradient-to-r from-[#7ADAA5]/10 to-[#98D8C8]/10 border-2 border-[#7ADAA5]/30 rounded-lg mb-6 animate-[slideUp_1s_ease-out]">
                <p className="text-sm text-gray-800 font-medium">
                  ✅ Your account is now fully activated
                </p>
                <p className="text-sm text-gray-800 font-medium mt-1">
                  ✅ You can now upload and share files
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-6 animate-pulse">
                Redirecting to login in 3 seconds...
              </p>
              <Link
                to="/login"
                className="inline-block w-full px-6 py-3 bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white rounded-lg hover:scale-105 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                Go to Login
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Error State */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6 animate-[shake_0.5s_ease-in-out]">
                <FiAlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 animate-[fadeIn_0.6s_ease-in]">Verification Failed</h1>
              <p className="text-gray-600 mb-6 animate-[fadeIn_0.8s_ease-in]">
                {message}
              </p>
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg mb-6 animate-[slideUp_1s_ease-out]">
                <div className="flex items-start gap-2">
                  <FiMail className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-yellow-800 font-medium mb-1">
                      Need a new verification link?
                    </p>
                    <p className="text-xs text-yellow-700">
                      Log in and request a new verification email from your dashboard.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white rounded-lg hover:scale-105 transition-all shadow-lg hover:shadow-xl font-medium"
                >
                  Go to Login
                </Link>
                <Link
                  to="/register"
                  className="w-full px-6 py-3 bg-white border-2 border-[#7ADAA5] text-gray-700 rounded-lg hover:bg-[#7ADAA5]/10 transition-all font-medium"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
