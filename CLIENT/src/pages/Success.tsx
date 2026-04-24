import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck, FiCopy, FiUpload, FiMail, FiClock } from 'react-icons/fi';
import { copyToClipboard, formatBytes, formatTimeRemaining } from '../utils/helpers';
import type { UploadResponse } from '../types';
import Navbar from '../components/Navbar';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const fileData = location.state?.fileData as UploadResponse | undefined;
  const emailsSent = location.state?.emailsSent as boolean | undefined;

  useEffect(() => {
    if (!fileData) {
      toast.error('No upload data found');
      navigate('/');
    }
  }, [fileData, navigate]);

  if (!fileData) {
    return null;
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(fileData.link);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const expiryFormatted = formatTimeRemaining(fileData.expiryTime);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#F0FFF4] via-[#FEFCF8] to-[#F7FEF9] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8 animate-[fadeIn_0.5s_ease-in]">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#7ADAA5] to-[#98D8C8] rounded-full mb-4 animate-[bounce_1s_ease-in-out]">
              <FiCheck className="w-10 h-10 text-white animate-[scaleIn_0.5s_ease-in]" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] bg-clip-text text-transparent mb-2 animate-[slideUp_0.6s_ease-out]">Upload Successful!</h1>
            <p className="text-gray-600 animate-[fadeIn_0.8s_ease-in]">Your files are ready to share</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-[#7ADAA5]/20 border-2 border-[#7ADAA5]/20 p-8 mb-6 animate-[slideUp_0.8s_ease-out]">
            {/* File Info */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-[#7ADAA5] to-[#98D8C8] bg-clip-text text-transparent mb-4">File Details</h2>
              <div className="space-y-3">
                <div className="flex items-start justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Files:</span>
                  <div className="text-right">
                    {fileData.originalFilenames.map((name, index) => (
                      <p key={index} className="text-gray-900 font-medium">
                        {name}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Size:</span>
                  <span className="text-gray-900 font-medium">{formatBytes(fileData.size)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Expires in:</span>
                  <span className="text-gray-900 font-medium flex items-center">
                    <FiClock className="w-4 h-4 mr-1" />
                    {expiryFormatted}
                  </span>
                </div>
                {fileData.isProtected && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Protection:</span>
                    <span className="text-green-600 font-medium flex items-center">
                      <FiCheck className="w-4 h-4 mr-1" />
                      PIN Protected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Share Link */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-[#7ADAA5] to-[#98D8C8] bg-clip-text text-transparent mb-4">Share Link</h2>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={fileData.link}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-[#7ADAA5]/30 rounded-lg bg-[#F0FFF4]/30 text-gray-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#7ADAA5]"
                />
                <button
                  onClick={handleCopy}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg ${
                    copied
                      ? 'bg-gradient-to-r from-[#7ADAA5] to-[#98D8C8] text-white scale-105'
                      : 'bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white hover:scale-105'
                  }`}
                >
                  {copied ? (
                    <>
                      <FiCheck className="w-5 h-5 animate-[scaleIn_0.3s_ease-in]" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-5 h-5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Email Notification */}
            {emailsSent && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#7ADAA5]/10 to-[#98D8C8]/10 border-2 border-[#7ADAA5]/30 rounded-lg animate-[fadeIn_1s_ease-in]">
                <div className="flex items-center gap-2 text-gray-800">
                  <FiMail className="w-5 h-5 text-[#7ADAA5]" />
                  <p className="font-medium">
                    Email notifications sent to recipients
                  </p>
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Important:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Save this link - you won't be able to see it again here</li>
                <li>• The link will expire in {expiryFormatted}</li>
                {fileData.isProtected && <li>• Recipients will need the 4-digit PIN to download</li>}
                <li>• You can manage your uploads from the Dashboard</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 animate-[slideUp_1s_ease-out]">
            <Link
              to="/upload"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white rounded-lg hover:scale-105 transition-all shadow-lg hover:shadow-xl font-medium text-center flex items-center justify-center gap-2"
            >
              <FiUpload className="w-5 h-5" />
              Upload Another File
            </Link>
            <Link
              to="/dashboard"
              className="flex-1 px-6 py-3 bg-white border-2 border-[#7ADAA5] text-gray-700 rounded-lg hover:bg-[#7ADAA5]/10 hover:scale-105 transition-all shadow-lg font-medium text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Success;
