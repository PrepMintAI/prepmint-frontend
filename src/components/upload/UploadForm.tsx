// src/components/upload/UploadForm.tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uploadForEvaluation } from '@/lib/api';
import { awardXp, XP_REWARDS } from '@/lib/gamify';
import { logger } from '@/lib/logger';
import useEvaluationPoll from '@/hooks/useEvaluationPoll';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import { Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface UploadFormProps {
  testId?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in MB
}

export default function UploadForm({
  testId,
  onSuccess,
  onError,
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png',
  maxFileSize = 10,
}: UploadFormProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poll evaluation status
  const { status, isPolling } = useEvaluationPoll(jobId, {
    onComplete: async (result) => {
      logger.log('✅ Evaluation complete:', result);
      
      // Award XP for completion
      if (user?.uid) {
        try {
          await awardXp(user.uid, XP_REWARDS.EVALUATION_COMPLETE, 'Completed answer sheet evaluation');
          
          // Bonus XP for perfect score
          if (result.score === 100) {
            await awardXp(user.uid, XP_REWARDS.PERFECT_SCORE, 'Perfect score achieved!');
          }
        } catch (err) {
          logger.error('Failed to award XP:', err);
        }
      }
      
      onSuccess?.(result);
    },
    onError: (errorMsg) => {
      logger.error('❌ Evaluation failed:', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
    },
  });

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // 1. File size check (10MB max)
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // 2. File type whitelist (STRICT: only PDF, JPG, PNG)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return 'Only PDF, JPG, and PNG files are allowed';
    }

    // 3. File name validation (prevent path traversal attacks)
    const fileName = file.name;

    // Check for path traversal patterns
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return 'Invalid file name. Please remove special characters.';
    }

    // Check for null bytes (potential attack vector)
    if (fileName.includes('\0')) {
      return 'Invalid file name detected';
    }

    // Check file name length (prevent DOS)
    if (fileName.length > 255) {
      return 'File name is too long. Please rename the file.';
    }

    // Check for valid file extension
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!validExtensions.includes(fileExtension)) {
      return 'Invalid file extension. Only PDF, JPG, and PNG files are allowed.';
    }

    // 4. File size minimum check (prevent 0-byte files)
    if (file.size === 0) {
      return 'File is empty. Please select a valid file.';
    }

    return null;
  }, [maxFileSize]);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    setError(null);
    
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(selectedFile);

    // Generate preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  }, [validateFile]);

  // File input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload file
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!user) {
      setError('You must be logged in to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.uid);
      if (testId) {
        formData.append('testId', testId);
      }

      const { data } = await uploadForEvaluation(formData);
      
      logger.log('📤 Upload successful, job ID:', data.jobId);
      setJobId(data.jobId); // Start polling
      
      // Award XP for first upload
      if (user.uid) {
        await awardXp(user.uid, XP_REWARDS.FIRST_UPLOAD, 'First answer sheet upload');
      }
    } catch (err) {
      logger.error('Upload error:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err &&
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data
        ? String(err.response.data.message)
        : 'Failed to upload file. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setJobId(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      {!jobId && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 transition-all
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
            ${file ? 'border-green-500 bg-green-50' : ''}
            ${error ? 'border-red-500 bg-red-50' : ''}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />

          {!file ? (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Upload Answer Sheet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload size={16} />}
              >
                Choose File
              </Button>
              <p className="text-xs text-gray-400 mt-3">
                Supported: Images, PDF • Max size: {maxFileSize}MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Preview */}
              <div className="flex items-start gap-4">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-gray-400" size={32} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="text-red-500" size={20} />
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      loading={uploading}
                      onClick={handleUpload}
                      leftIcon={<Upload size={16} />}
                      fullWidth
                    >
                      {uploading ? 'Uploading...' : 'Start Evaluation'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveFile}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Upload Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Polling Status */}
      {isPolling && status && (
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Evaluating Your Answer Sheet
              </h3>
              <p className="text-sm text-blue-600 mt-1 capitalize">
                Status: {status.status}
              </p>
            </div>
            <Spinner size="md" variant="primary" />
          </div>

          {status.progress !== undefined && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-blue-700 mb-2">
                <span>Progress</span>
                <span>{status.progress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            </div>
          )}

          <p className="text-xs text-blue-600 mt-3">
            This may take a few moments. Please dont close this window.
          </p>
        </div>
      )}

      {/* Success State */}
      {status?.status === 'done' && !isPolling && (
        <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900">
                Evaluation Complete!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Your answer sheet has been successfully evaluated.
              </p>
              {status.result && (
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Score:</span>{' '}
                    <span className="text-lg font-bold text-green-600">
                      {status.result.score}%
                    </span>
                  </p>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Button variant="primary" size="sm" onClick={() => onSuccess?.(status.result)}>
                  View Detailed Results
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Upload Another
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
