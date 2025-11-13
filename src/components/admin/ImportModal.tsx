// src/components/admin/ImportModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { logger } from '@/lib/logger';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
  templateHeaders: string[];
  templateExample?: string[][];
  entityName: string; // e.g., "Users", "Students", "Teachers"
}

type Step = 'download' | 'upload' | 'preview' | 'confirm';

export default function ImportModal({
  isOpen,
  onClose,
  onImport,
  templateHeaders,
  templateExample = [],
  entityName,
}: ImportModalProps) {
  const [step, setStep] = useState<Step>('download');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownloadTemplate = () => {
    const csvContent = [
      templateHeaders.join(','),
      ...(templateExample.length > 0
        ? templateExample.map((row) => row.join(','))
        : [templateHeaders.map(() => '').join(',')]),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${entityName.toLowerCase()}_template_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logger.log(`Template downloaded for ${entityName}`);
    setStep('upload');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
      setError('Please upload a CSV or Excel file');
      return;
    }

    setFile(selectedFile);
    setError('');

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter((line) => line.trim());
      const headers = lines[0].split(',').map((h) => h.trim());
      const data = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setParsedData(data);

      // Auto-map columns if headers match
      const mapping: Record<number, string> = {};
      headers.forEach((header, index) => {
        const matchedTemplate = templateHeaders.find(
          (th) => th.toLowerCase() === header.toLowerCase()
        );
        if (matchedTemplate) {
          mapping[index] = matchedTemplate;
        }
      });
      setColumnMapping(mapping);

      setStep('preview');
    } catch (err) {
      logger.error('Error parsing file:', err);
      setError('Failed to parse file. Please check the format.');
    }
  };

  const handleConfirmImport = async () => {
    try {
      setLoading(true);
      setError('');

      // Transform data based on column mapping
      const mappedData = parsedData.map((row) => {
        const mapped: any = {};
        Object.entries(columnMapping).forEach(([index, header]) => {
          const keys = Object.keys(row);
          mapped[header] = row[keys[parseInt(index)]];
        });
        return mapped;
      });

      await onImport(mappedData);
      onClose();
      resetModal();
    } catch (err) {
      logger.error('Error importing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('download');
    setFile(null);
    setParsedData([]);
    setColumnMapping({});
    setError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={24} />
                <div>
                  <h2 className="text-2xl font-bold">Import {entityName}</h2>
                  <p className="text-purple-100 text-sm mt-1">
                    Step {step === 'download' ? 1 : step === 'upload' ? 2 : step === 'preview' ? 3 : 4} of 4
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {/* Step 1: Download Template */}
            {step === 'download' && (
              <div className="text-center py-8">
                <FileSpreadsheet size={64} className="mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Download Template</h3>
                <p className="text-gray-600 mb-6">
                  Download the Excel template with example data to get started
                </p>
                <Button
                  variant="primary"
                  leftIcon={<Download size={18} />}
                  onClick={handleDownloadTemplate}
                >
                  Download Template
                </Button>
                <div className="mt-8 text-left bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Template includes:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {templateHeaders.map((header) => (
                      <li key={header}>• {header}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Step 2: Upload File */}
            {step === 'upload' && (
              <div className="text-center py-8">
                <Upload size={64} className="mx-auto mb-4 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload File</h3>
                <p className="text-gray-600 mb-6">
                  Upload your filled Excel or CSV file
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="primary" leftIcon={<Upload size={18} />} as="span">
                    Select File
                  </Button>
                </label>
                {file && (
                  <div className="mt-4 text-sm text-gray-600">
                    Selected: {file.name}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Preview Data */}
            {step === 'preview' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Preview & Map Columns</h3>
                <p className="text-gray-600 mb-6">
                  Review the data and map columns to the correct fields
                </p>

                {/* Column Mapping */}
                <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="font-medium text-gray-900 mb-3">Column Mapping:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(parsedData[0] || {}).map((header, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 flex-shrink-0 w-32 truncate">
                          {header}:
                        </span>
                        <select
                          value={columnMapping[index] || ''}
                          onChange={(e) =>
                            setColumnMapping({ ...columnMapping, [index]: e.target.value })
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Skip</option>
                          {templateHeaders.map((th) => (
                            <option key={th} value={th}>
                              {th}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Preview */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        {templateHeaders.map((header) => (
                          <th key={header} className="px-4 py-2 text-left font-medium text-gray-900">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {parsedData.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {templateHeaders.map((header) => {
                            const columnIndex = Object.entries(columnMapping).find(
                              ([, h]) => h === header
                            )?.[0];
                            const keys = Object.keys(row);
                            const value = columnIndex ? row[keys[parseInt(columnIndex)]] : '';
                            return (
                              <td key={header} className="px-4 py-2 text-gray-700">
                                {value || '-'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Showing 5 of {parsedData.length} rows
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 flex justify-between">
            <Button variant="ghost" onClick={step === 'download' ? handleClose : () => setStep(step === 'upload' ? 'download' : step === 'preview' ? 'upload' : 'preview')}>
              {step === 'download' ? 'Cancel' : 'Back'}
            </Button>
            <div className="flex gap-3">
              {step === 'preview' && (
                <Button
                  variant="primary"
                  onClick={handleConfirmImport}
                  disabled={loading || Object.keys(columnMapping).length === 0}
                  leftIcon={loading ? undefined : <CheckCircle size={18} />}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    `Import ${parsedData.length} ${entityName}`
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
