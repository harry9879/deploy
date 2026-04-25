import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiLock, FiClock, FiAlertCircle, FiUser } from 'react-icons/fi';
import fileService from '../services/fileService';
import { formatBytes, formatTimeRemaining, getFileIcon } from '../utils/helpers';
import type { FileMetadata } from '../types';
import Loader from '../components/UI/Loader/loader-15';

const Download = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fileData, setFileData] = useState<FileMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // PIN verification state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);


  // Fetch file metadata
  useEffect(() => {
    const fetchFileData = async () => {
      if (!uuid) {
        setError('Invalid download link');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fileService.getFileMetadata(uuid);
        setFileData(response.data!);
        
        // Show PIN modal if file is protected and not yet verified
        if (response.data!.isProtected && !pinVerified) {
          setShowPinModal(true);
        }
      } catch (err: any) {
        console.error('Error fetching file:', err);
        setError(err.response?.data?.message || 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    fetchFileData();
  }, [uuid, pinVerified]);

  // Verify PIN
  const handleVerifyPin = async () => {
    if (pin.length !== 4) {
      setPinError('PIN must be 4 digits');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setPinError('PIN must contain only numbers');
      return;
    }

    try {
      setVerifyingPin(true);
      setPinError('');
      await fileService.verifyPin(uuid!, pin);
      setPinVerified(true);
      setShowPinModal(false);
      toast.success('PIN verified! You can now download the file.');
    } catch (err: any) {
      console.error('PIN verification error:', err);
      setPinError(err.response?.data?.message || 'Invalid PIN. Please try again.');
      setPin('');
    } finally {
      setVerifyingPin(false);
    }
  };



  // Handle download
  const handleDownload = async () => {
    if (!fileData) return;

    if (fileData.isProtected && !pinVerified) {
      setShowPinModal(true);
      toast.error('Please enter the PIN to download');
      return;
    }

    if (!fileData.canDownload) {
      toast.error(fileData.downloadMessage || 'File cannot be downloaded');
      return;
    }

    const loadingToast = toast.loading('Preparing download...');

    try {
      // Call the download endpoint — for S3 files it returns JSON with a presigned URL
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const endpointUrl = `${apiBase}/files/${uuid}/download`;

      const response = await fetch(endpointUrl, { credentials: 'include' });
      const contentType = response.headers.get('Content-Type') || '';

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Download failed: ${response.statusText}`);
      }

      toast.dismiss(loadingToast);

      // S3 file: server returns { downloadUrl } — navigate directly
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.downloadUrl) {
          window.location.href = data.downloadUrl;
          toast.success('Download started!');
          return;
        }
      }

      // Local file: server streams the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileData.originalFilenames[0] || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download completed!');
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error('Download error:', error);
      toast.error(error.message || 'Download failed. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0FFF4] via-[#FEFCF8] to-[#F7FEF9]">
        <div className="text-center">
          <Loader />
          <p className="text-gray-600 mt-4">Loading file...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !fileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">File Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This file may have expired or been deleted.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white rounded-lg hover:scale-105 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // File expired or unavailable
  if (!fileData.canDownload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <FiAlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">File Unavailable</h1>
          <p className="text-gray-600 mb-6">
            {fileData.downloadMessage || 'This file has expired or reached its download limit.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white rounded-lg hover:scale-105 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const expiryFormatted = formatTimeRemaining(fileData.expiryTime);
  const isImage = fileData.contentTypes.some(type => type.startsWith('image/'));
  const isPdf = fileData.contentTypes.some(type => type === 'application/pdf');

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F0FFF4] via-[#FEFCF8] to-[#F7FEF9] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Download Files</h1>
          <p className="text-gray-600">Shared with you via secure link</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Sender Info */}
          {fileData.sender && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#7ADAA5]/10 to-[#98D8C8]/10 border-2 border-[#7ADAA5]/30 rounded-lg">
              <div className="flex items-center gap-2 text-gray-800">
                <FiUser className="w-5 h-5" />
                <div>
                  <p className="font-medium">Sent by {fileData.sender.name}</p>
                  <p className="text-sm text-gray-700">{fileData.sender.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          {fileData.message && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{fileData.message}</p>
            </div>
          )}

          {/* File Details */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">File Details</h2>
            <div className="space-y-3">
              {/* Files List */}
              <div className="border-b border-gray-100 pb-3">
                <span className="text-gray-600 text-sm font-medium">Files:</span>
                <div className="mt-2 space-y-2">
                  {fileData.originalFilenames.map((filename, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-2xl">{getFileIcon(fileData.contentTypes[index] || '')}</span>
                      <span className="text-gray-900 font-medium">{filename}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Size */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Size:</span>
                <span className="text-gray-900 font-medium">{formatBytes(fileData.size)}</span>
              </div>

              {/* Expiry */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Expires in:</span>
                <span className="text-gray-900 font-medium flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  {expiryFormatted}
                </span>
              </div>

              {/* Download Count */}
              {fileData.maxDownloads && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Downloads:</span>
                  <span className="text-gray-900 font-medium">
                    {fileData.downloadCount} / {fileData.maxDownloads}
                  </span>
                </div>
              )}

              {/* Protected Status */}
              {fileData.isProtected && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Protection:</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    pinVerified ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    <FiLock className="w-4 h-4" />
                    {pinVerified ? 'PIN Verified' : 'PIN Required'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Preview for images/PDFs */}
          {(isImage || isPdf) && pinVerified && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Preview</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {isImage && (
                  <img
                    src={fileService.streamFile(uuid!)}
                    alt="File preview"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                  />
                )}
                {isPdf && (
                  <iframe
                    src={fileService.streamFile(uuid!)}
                    className="w-full h-96"
                    title="PDF Preview"
                  />
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="w-full py-4 bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white rounded-lg hover:scale-105 transition-colors font-medium text-lg flex items-center justify-center gap-2"
            >
              <FiDownload className="w-6 h-6" />
              Download {fileData.isZipped ? 'ZIP Archive' : 'File'}
            </button>
          </div>

          {/* Warning */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This link will expire in {expiryFormatted}. 
              {fileData.maxDownloads && ` Maximum ${fileData.maxDownloads} downloads allowed.`}
            </p>
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#7ADAA5]/20 to-[#98D8C8]/20 rounded-full mb-4">
                <FiLock className="w-8 h-8 text-[#7ADAA5]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">PIN Required</h2>
              <p className="text-gray-600">
                This file is protected. Please enter the 4-digit PIN to access it.
              </p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(value);
                  setPinError('');
                }}
                maxLength={4}
                className={`w-full px-4 py-3 text-center text-2xl tracking-widest border-2 rounded-lg focus:outline-none focus:ring-2 ${
                  pinError
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                autoFocus
              />
              {pinError && (
                <p className="mt-2 text-sm text-red-600 text-center">{pinError}</p>
              )}
            </div>

            <button
              onClick={handleVerifyPin}
              disabled={verifyingPin || pin.length !== 4}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                verifyingPin || pin.length !== 4
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {verifyingPin ? 'Verifying...' : 'Verify PIN'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Download;
