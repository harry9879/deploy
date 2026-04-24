export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  storageUsed: number;
  storagePercentage: number;
  createdAt: string;
}

export interface File {
  _id: string;
  uuid: string;
  ownerId: string;
  originalFilenames: string[];
  storedPath: string;
  size: number;
  uploadTime: string;
  expiryTime: string;
  maxDownloads: number | null;
  downloadCount: number;
  senderEmail: string;
  receiverEmails: string[];
  message: string;
  pinHash: string | null;
  isZipped: boolean;
  contentTypes: string[];
  isProtected: boolean;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadLog {
  _id: string;
  fileId: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  userId: string | null;
  success: boolean;
  action: 'download' | 'preview' | 'stream';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  storageWarning?: string;
}

export interface UploadFormData {
  files: FileList;
  expiryHours?: number;
  expiryMinutes?: number;
  maxDownloads?: number;
  receiverEmails?: string;
  message?: string;
  pin?: string;
}

export interface UploadResponse {
  fileId: string;
  uuid: string;
  link: string;
  expiryTime: string;
  originalFilenames: string[];
  size: number;
  isProtected: boolean;
  emailSent: boolean;
}

export interface FileMetadata {
  uuid: string;
  originalFilenames: string[];
  size: number;
  uploadTime: string;
  expiryTime: string;
  downloadCount: number;
  maxDownloads: number | null;
  isProtected: boolean;
  isZipped: boolean;
  contentTypes: string[];
  canDownload: boolean;
  downloadMessage: string | null;
  sender: {
    name: string;
    email: string;
  };
  message: string;
}

export interface Analytics {
  totalFiles: number;
  activeFiles: number;
  expiredFiles: number;
  totalDownloads: number;
  storage: {
    used: number;
    max: number;
    percentage: string;
    available: number;
  };
  recentUploads: File[];
}

export interface GlobalAnalytics {
  overview: {
    totalUsers: number;
    newUsers: number;
    totalFiles: number;
    activeFiles: number;
    expiredFiles: number;
    filesInRange: number;
    totalDownloads: number;
    downloadsInRange: number;
  };
  storage: {
    used: number;
    max: number;
    percentage: string;
    available: number;
    warning: boolean;
  };
  fileTypes: Record<string, number>;
  trends: {
    uploads: Array<{ _id: string; count: number }>;
    downloads: Array<{ _id: string; count: number }>;
  };
  topContent: {
    largestFiles: File[];
    mostDownloaded: File[];
  };
  topUsers: {
    byStorage: User[];
    byUploads: Array<{ _id: string; uploadCount: number; name: string; email: string }>;
  };
  dateRange: {
    from: string;
    to: string;
    type: string;
  };
}
