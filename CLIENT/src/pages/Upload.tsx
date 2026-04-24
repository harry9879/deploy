import { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiFile, FiLock } from 'react-icons/fi';
import fileService from '../services/fileService';
import { formatBytes, parseEmails } from '../utils/helpers';

const EXPIRY_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 60, label: '1 hour' },
  { value: 360, label: '6 hours' },
  { value: 720, label: '12 hours' },
  { value: 1440, label: '24 hours' },
];

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form fields
  const [expiryMinutes, setExpiryMinutes] = useState(1440); // Default 24 hours
  const [maxDownloads, setMaxDownloads] = useState<number | ''>('');
  const [receiverEmails, setReceiverEmails] = useState('');
  const [message, setMessage] = useState('');
  const [pin, setPin] = useState('');
  const [enablePin, setEnablePin] = useState(false);

  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  // Add files with validation
  const addFiles = (files: File[]) => {
    const MAX_FILES = 10;
    const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

    // Check total file count
    if (selectedFiles.length + files.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 200MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
  };

  // Remove file
  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  // Calculate total size
  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (enablePin && pin.length !== 4) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    if (enablePin && !/^\d{4}$/.test(pin)) {
      toast.error('PIN must contain only digits');
      return;
    }

    // Parse and validate emails
    let emails: string[] = [];
    if (receiverEmails.trim()) {
      const parsed = parseEmails(receiverEmails);
      if (parsed.length > 5) {
        toast.error('Maximum 5 receiver emails allowed');
        return;
      }
      emails = parsed;
    }

    // Validate message length
    if (message.length > 400) {
      toast.error('Message must be 400 characters or less');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Prepare form data
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Convert total minutes to hours and minutes
      const hours = Math.floor(expiryMinutes / 60);
      const minutes = expiryMinutes % 60;
      
      if (hours > 0) {
        formData.append('expiryHours', hours.toString());
      }
      if (minutes > 0) {
        formData.append('expiryMinutes', minutes.toString());
      }
      // If both are 0, just send 24 hours as default
      if (hours === 0 && minutes === 0) {
        formData.append('expiryHours', '24');
      }
      
      if (maxDownloads && maxDownloads > 0) {
        formData.append('maxDownloads', maxDownloads.toString());
      }

      if (emails.length > 0) {
        formData.append('receiverEmails', emails.join(','));
      }

      if (message.trim()) {
        formData.append('message', message.trim());
      }

      if (enablePin && pin) {
        formData.append('pin', pin);
      }

      // Upload with progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fileService.uploadFiles(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Show storage warning if present
      if (response.storageWarning) {
        toast(response.storageWarning, { 
          duration: 5000,
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
          }
        });
      }

      toast.success('Files uploaded successfully!');

      // Navigate to success page with file data
      setTimeout(() => {
        navigate('/success', { 
          state: { 
            fileData: response.data,
            emailsSent: emails.length > 0 
          } 
        });
      }, 500);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F0FFF4] via-[#FEFCF8] to-[#F7FEF9] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Files</h1>
          <p className="text-gray-600">Share your files securely with anyone</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragging
                ? 'border-[#7ADAA5] bg-[#F0FFF4]'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FiUpload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop files here
            </p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white rounded-lg hover:scale-105 transition-colors"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-4">
              Max 10 files, 200MB per file
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Selected Files ({selectedFiles.length})
                </h3>
                <span className="text-sm text-gray-500">
                  Total: {formatBytes(totalSize)}
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FiFile className="w-5 h-5 text-gray-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-3 p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="mt-8 space-y-6">
            {/* Expiry Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Expiry
              </label>
              <select
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ADAA5] focus:border-transparent"
              >
                {EXPIRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Downloads */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Downloads (Optional)
              </label>
              <input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={maxDownloads}
                onChange={(e) => setMaxDownloads(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ADAA5] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for unlimited downloads
              </p>
            </div>

            {/* Receiver Emails */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receiver Emails (Optional)
              </label>
              <input
                type="text"
                placeholder="email1@example.com, email2@example.com"
                value={receiverEmails}
                onChange={(e) => setReceiverEmails(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ADAA5] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple emails with commas (max 5)
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                placeholder="Add a personal message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={400}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ADAA5] focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/400 characters
              </p>
            </div>

            {/* PIN Protection */}
            <div>
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="enablePin"
                  checked={enablePin}
                  onChange={(e) => {
                    setEnablePin(e.target.checked);
                    if (!e.target.checked) setPin('');
                  }}
                  className="w-4 h-4 text-[#7ADAA5] border-gray-300 rounded focus:ring-[#7ADAA5]"
                />
                <label htmlFor="enablePin" className="ml-2 text-sm font-medium text-gray-700">
                  Enable PIN Protection
                </label>
              </div>
              {enablePin && (
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter 4-digit PIN"
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPin(value);
                    }}
                    maxLength={4}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7ADAA5] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recipients will need this PIN to download files
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#7ADAA5] to-[#98D8C8] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || selectedFiles.length === 0}
            className={`w-full mt-8 py-3 rounded-lg font-semibold transition-all shadow-lg ${
              uploading || selectedFiles.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#7ADAA5] via-[#98D8C8] to-[#B8E994] text-white hover:scale-105 hover:shadow-xl'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
