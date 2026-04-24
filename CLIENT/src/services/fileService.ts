import api from './api';
import type { ApiResponse, UploadResponse, FileMetadata, File, DownloadLog, Analytics } from '../types';

export const fileService = {
  uploadFiles: async (formData: FormData): Promise<ApiResponse<UploadResponse>> => {
    const response = await api.post<ApiResponse<UploadResponse>>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFileMetadata: async (uuid: string): Promise<ApiResponse<FileMetadata>> => {
    const response = await api.get<ApiResponse<FileMetadata>>(`/files/${uuid}`);
    return response.data;
  },

  verifyPin: async (uuid: string, pin: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/files/${uuid}/verify-pin`, { pin });
    return response.data;
  },

  downloadFile: (uuid: string): string => {
    return `${api.defaults.baseURL}/files/${uuid}/download`;
  },

  streamFile: (uuid: string): string => {
    return `${api.defaults.baseURL}/files/${uuid}/stream`;
  },

  getUserUploads: async (params?: {
    search?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ files: File[]; pagination: any }>> => {
    const response = await api.get<ApiResponse<{ files: File[]; pagination: any }>>(
      '/dashboard/uploads',
      { params }
    );
    return response.data;
  },

  extendExpiry: async (
    fileId: string,
    extensionType: string,
    customHours?: number
  ): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/dashboard/files/${fileId}/extend`, {
      extensionType,
      customHours,
    });
    return response.data;
  },

  deleteFile: async (fileId: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/dashboard/files/${fileId}`);
    return response.data;
  },

  getFileLogs: async (
    fileId: string
  ): Promise<ApiResponse<{ logs: DownloadLog[]; totalDownloads: number; totalStreams: number }>> => {
    const response = await api.get<
      ApiResponse<{ logs: DownloadLog[]; totalDownloads: number; totalStreams: number }>
    >(`/dashboard/files/${fileId}/logs`);
    return response.data;
  },

  getUserAnalytics: async (): Promise<ApiResponse<Analytics>> => {
    const response = await api.get<ApiResponse<Analytics>>('/dashboard/analytics');
    return response.data;
  },
};

export default fileService;
