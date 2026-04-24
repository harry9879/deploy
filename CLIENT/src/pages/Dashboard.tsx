import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiFile, FiClock, FiDownload, FiCopy, FiTrash2, FiSearch,
  FiRefreshCw, FiAlertCircle, FiCheck, FiPlusCircle, FiMail
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import fileService from '../services/fileService';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/UI/Loader/loader-15';
import { 
  formatBytes, 
  formatRelativeTime, 
  copyToClipboard,
  getFileIcon,
  formatTimeRemaining
} from '../utils/helpers';
import type { File, Analytics } from '../types';

const Dashboard = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'expired'>('all');
  const [resendingEmail, setResendingEmail] = useState(false);
  
  // Load dashboard data
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [filesResponse, analyticsResponse] = await Promise.all([
        fileService.getUserUploads({ limit: 50 }),
        fileService.getUserAnalytics(),
      ]);
      
      setFiles(filesResponse.data?.files || []);
      setAnalytics(analyticsResponse.data!);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Filter files
  const filteredFiles = files.filter(file => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      file.originalFilenames.some(name => 
        name.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      file.receiverEmails.some(email => 
        email.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Type filter
    const matchesType = 
      filterType === 'all' ||
      (filterType === 'active' && !file.isExpired) ||
      (filterType === 'expired' && file.isExpired);

    return matchesSearch && matchesType;
  });

  // Handle copy link
  const handleCopyLink = async (uuid: string) => {
    const link = `${window.location.origin}/download/${uuid}`;
    const success = await copyToClipboard(link);
    if (success) {
      toast.success('Link copied to clipboard!');
    }
  };

  // Handle delete
  const handleDelete = async (fileId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      await fileService.deleteFile(fileId);
      toast.success('File deleted successfully');
      loadDashboard(); // Reload data
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(error.response?.data?.message || 'Failed to delete file');
    }
  };

  // Handle extend expiry
  const handleExtendExpiry = async (fileId: string) => {
    try {
      await fileService.extendExpiry(fileId, '24hours');
      toast.success('Expiry extended by 24 hours');
      loadDashboard(); // Reload data
    } catch (error: any) {
      console.error('Error extending expiry:', error);
      toast.error(error.response?.data?.message || 'Failed to extend expiry');
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    try {
      setResendingEmail(true);
      await authService.resendVerification();
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0FFF4] via-[#FEFCF8] to-[#F7FEF9]">
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#F0FFF4] via-[#FEFCF8] to-[#F7FEF9] py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Manage your uploads and view analytics</p>
          </div>

          {/* Email Verification Banner */}
          {user && !user.isEmailVerified && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-3">
                <FiMail className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-1">Email Not Verified</h3>
                  <p className="text-sm text-yellow-800 mb-3">
                    Please verify your email address to upload files. Check your inbox for the verification link.
                  </p>
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Files */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Total Files</span>
                  <FiFile className="w-5 h-5 text-[#7ADAA5]" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalFiles}</p>
              </div>

              {/* Active Files */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Active Files</span>
                  <FiCheck className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.activeFiles}</p>
              </div>

              {/* Total Downloads */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Total Downloads</span>
                  <FiDownload className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalDownloads}</p>
              </div>

              {/* Storage Used */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Storage Used</span>
                  <FiAlertCircle className={`w-5 h-5 ${
                    parseFloat(analytics.storage.percentage) >= 80 ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.storage.percentage}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatBytes(analytics.storage.used)} / {formatBytes(analytics.storage.max)}
                </p>
              </div>
            </div>
          )}

          {/* Files Section */}
          <div className="bg-white rounded-xl shadow">
            {/* Toolbar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ADAA5] focus:border-transparent"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterType === 'all'
                        ? 'bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterType === 'active'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilterType('expired')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterType === 'expired'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Expired
                  </button>
                </div>

                {/* Upload Button */}
                <Link
                  to="/upload"
                  className="px-4 py-2 bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white rounded-lg hover:scale-105 transition-colors font-medium flex items-center gap-2"
                >
                  <FiPlusCircle className="w-5 h-5" />
                  New Upload
                </Link>
              </div>
            </div>

            {/* Files List */}
            <div className="divide-y divide-gray-200">
              {filteredFiles.length === 0 ? (
                <div className="p-12 text-center">
                  <FiFile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No files found</p>
                  <p className="text-sm text-gray-500">
                    {searchQuery ? 'Try a different search term' : 'Upload your first file to get started'}
                  </p>
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div key={file._id} className="p-6 hover:bg-gradient-to-br from-[#F0FFF4] via-[#FEFCF8] to-[#F7FEF9] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getFileIcon(file.contentTypes[0] || '')}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {file.originalFilenames.join(', ')}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>{formatBytes(file.size)}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(file.uploadTime)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <FiDownload className="w-3 h-3" />
                                {file.downloadCount} downloads
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 mt-3">
                          {file.isExpired ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              Expired
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              Expires {formatTimeRemaining(file.expiryTime)}
                            </span>
                          )}
                          {file.isProtected && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              PIN Protected
                            </span>
                          )}
                          {file.isZipped && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              ZIP
                            </span>
                          )}
                        </div>

                        {/* Recipients */}
                        {file.receiverEmails.length > 0 && (
                          <p className="text-sm text-gray-600 mt-2">
                            Sent to: {file.receiverEmails.join(', ')}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!file.isExpired && (
                          <>
                            <button
                              onClick={() => handleCopyLink(file.uuid)}
                              className="p-2 text-[#7ADAA5] hover:bg-[#F0FFF4] rounded-lg transition-colors"
                              title="Copy link"
                            >
                              <FiCopy className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleExtendExpiry(file._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Extend expiry by 24h"
                            >
                              <FiRefreshCw className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(file._id, file.originalFilenames[0])}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
