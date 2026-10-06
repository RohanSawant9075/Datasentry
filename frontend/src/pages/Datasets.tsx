import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Database,
  Search,
  Filter,
  Trash2,
  Eye,
  X,
  FileSpreadsheet,
  FileCode,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useNotificationStore } from '../stores/notificationStore';

export interface DatasetItem {
  id: string;
  name: string;
  sourceType: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'PROCESSING';
  rowCount: number;
  columnCount: number;
  fileSize: number;
  quality: number;
  reliability: number;
  createdAt: string;
  s3Key?: string;
}

const DEFAULT_DATASETS: DatasetItem[] = [
  {
    id: '1',
    name: 'retail_sales_q3_2026.csv',
    sourceType: 'CSV',
    status: 'HEALTHY',
    rowCount: 10000,
    columnCount: 8,
    fileSize: 2458624,
    quality: 92,
    reliability: 88,
    createdAt: '2026-09-14T10:00:00Z',
  },
  {
    id: '2',
    name: 'inventory_snapshot.xlsx',
    sourceType: 'EXCEL',
    status: 'WARNING',
    rowCount: 5420,
    columnCount: 12,
    fileSize: 1048576,
    quality: 78,
    reliability: 73,
    createdAt: '2026-09-13T14:30:00Z',
  },
  {
    id: '3',
    name: 'product_catalog.json',
    sourceType: 'JSON',
    status: 'CRITICAL',
    rowCount: 850,
    columnCount: 15,
    fileSize: 524288,
    quality: 62,
    reliability: 58,
    createdAt: '2026-09-12T09:15:00Z',
  },
  {
    id: '4',
    name: 'customer_data_sample.csv',
    sourceType: 'CSV',
    status: 'HEALTHY',
    rowCount: 15000,
    columnCount: 10,
    fileSize: 3145728,
    quality: 95,
    reliability: 91,
    createdAt: '2026-09-11T16:45:00Z',
  },
];

export function Datasets() {
  const [datasets, setDatasets] = useState<DatasetItem[]>(DEFAULT_DATASETS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal & Upload States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotificationStore();

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/datasets');
      if (res.data && Array.isArray(res.data.data)) {
        if (res.data.data.length > 0) {
          setDatasets(res.data.data);
        } else {
          setDatasets(DEFAULT_DATASETS);
        }
      }
    } catch (err: any) {
      console.warn('API fetch datasets returned fallback:', err.message);
      // Keep default datasets on failure/offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // Poll processing datasets
  useEffect(() => {
    const hasProcessing = datasets.some((d) => d.status === 'PROCESSING');
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchDatasets();
    }, 4000);

    return () => clearInterval(interval);
  }, [datasets]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage('');
    setUploadStatus('idle');

    const validExtensions = ['csv', 'json', 'xlsx', 'xls'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !validExtensions.includes(extension)) {
      setErrorMessage('Please select a valid dataset file (.csv, .json, .xlsx, .xls)');
      setSelectedFile(null);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 100 MB limit.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(15);
      setErrorMessage('');

      const formData = new FormData();
      formData.append('file', selectedFile);

      setUploadProgress(45);

      await api.post('/datasets/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(Math.min(percent, 90));
          }
        },
      });

      setUploadProgress(100);
      setUploadStatus('success');

      // Show success notification
      addNotification({
        title: 'Dataset Uploaded Successfully',
        message: `${selectedFile.name} has been uploaded and is being processed.`,
        type: 'success',
        link: '/datasets',
      });

      // Refresh list
      await fetchDatasets();

      // Reset modal after short delay
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus('idle');
        setUploading(false);
      }, 1500);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadStatus('error');
      const errorMsg = err.response?.data?.message || err.message || 'Failed to upload and process dataset.';
      setErrorMessage(errorMsg);

      // Show error notification
      addNotification({
        title: 'Upload Failed',
        message: errorMsg,
        type: 'error',
      });

      setUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete dataset "${name}"?`)) return;

    try {
      setDeletingId(id);
      await api.delete(`/datasets/${id}`);
      setDatasets((prev) => prev.filter((d) => d.id !== id));

      // Show success notification
      addNotification({
        title: 'Dataset Deleted',
        message: `${name} has been successfully deleted.`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Delete failed:', err);
      // Remove locally from UI if offline/mock
      setDatasets((prev) => prev.filter((d) => d.id !== id));

      // Show warning notification
      addNotification({
        title: 'Dataset Removed',
        message: `${name} has been removed from view.`,
        type: 'warning',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (ext === 'json') return <FileCode className="w-5 h-5 text-amber-400" />;
    if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet className="w-5 h-5 text-blue-400" />;
    return <FileText className="w-5 h-5 text-brand-pink" />;
  };

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dataset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const healthyCount = datasets.filter((d) => d.status === 'HEALTHY').length;
  const warningCount = datasets.filter((d) => d.status === 'WARNING').length;
  const criticalCount = datasets.filter((d) => d.status === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Datasets Catalog</h1>
          <p className="text-text-secondary">
            Ingest, profile, and continuously monitor data quality, drift & anomalies
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchDatasets}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
            title="Refresh Datasets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsModalOpen(true);
              setSelectedFile(null);
              setErrorMessage('');
              setUploadStatus('idle');
            }}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-brand-primary/20"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Dataset</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Datasets', value: datasets.length.toString(), icon: Database, color: 'text-brand-pink' },
          { label: 'Healthy Datasets', value: healthyCount.toString(), icon: CheckCircle2, color: 'text-status-healthy' },
          { label: 'Warning Status', value: warningCount.toString(), icon: AlertCircle, color: 'text-status-warning' },
          { label: 'Critical / Action Req.', value: criticalCount.toString(), icon: AlertCircle, color: 'text-status-critical' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 border-l-4 border-l-brand-primary"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
              <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">Live</span>
            </div>
            <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
            <div className="text-sm text-text-muted">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search datasets by name or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-11 w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto min-w-[160px]"
            >
              <option value="all">All Statuses</option>
              <option value="HEALTHY">Healthy</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
              <option value="PROCESSING">Processing</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Datasets Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background-card/50">
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Dataset Name
                </th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Source
                </th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Status
                </th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Rows / Cols
                </th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Quality Score
                </th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Reliability
                </th>
                <th className="text-left p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Ingested At
                </th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDatasets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-muted">
                    <Database className="w-12 h-12 mx-auto mb-3 opacity-40 text-brand-pink" />
                    <p className="text-lg font-medium text-text-secondary">No datasets match your filters</p>
                    <p className="text-sm mt-1">Upload a new dataset to initiate automated ML quality checks and anomaly detection.</p>
                  </td>
                </tr>
              ) : (
                filteredDatasets.map((dataset, index) => (
                  <motion.tr
                    key={dataset.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-background-card/80 transition-colors group"
                  >
                    <td className="p-4">
                      <Link
                        to={`/datasets/${dataset.id}`}
                        className="flex items-center gap-3 hover:text-brand-pink transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-background-secondary border border-border group-hover:border-brand-pink/40 transition-colors">
                          {getFileIcon(dataset.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary group-hover:text-brand-pink transition-colors flex items-center gap-1.5">
                            {dataset.name}
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-xs text-text-muted">
                            {formatFileSize(dataset.fileSize)}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="p-4">
                      <span className="badge badge-info uppercase">{dataset.sourceType}</span>
                    </td>

                    <td className="p-4">
                      {dataset.status === 'PROCESSING' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-brand-primary/20 text-brand-pink border border-brand-primary/40 animate-pulse">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Processing ML
                        </span>
                      ) : (
                        <span
                          className={`badge ${
                            dataset.status === 'HEALTHY'
                              ? 'badge-healthy'
                              : dataset.status === 'WARNING'
                              ? 'badge-warning'
                              : 'badge-critical'
                          }`}
                        >
                          {dataset.status}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right text-text-secondary text-sm">
                      <span className="font-medium text-text-primary">
                        {dataset.rowCount ? dataset.rowCount.toLocaleString() : '—'}
                      </span>
                      <span className="text-xs text-text-muted ml-1">
                        ({dataset.columnCount || '—'} cols)
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-background-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              dataset.quality >= 85
                                ? 'bg-status-healthy'
                                : dataset.quality >= 70
                                ? 'bg-status-warning'
                                : 'bg-status-critical'
                            }`}
                            style={{ width: `${dataset.quality || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{dataset.quality || 0}%</span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-background-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-primary via-brand-muted to-brand-pink"
                            style={{ width: `${dataset.reliability || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{dataset.reliability || 0}%</span>
                      </div>
                    </td>

                    <td className="p-4 text-sm text-text-muted">
                      {formatDate(dataset.createdAt)}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/datasets/${dataset.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-brand-secondary/60 rounded-button transition-colors"
                            title="Inspect Quality & Profiling"
                          >
                            <Eye className="w-4 h-4 text-brand-pink" />
                          </motion.button>
                        </Link>

                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(dataset.id, dataset.name)}
                          disabled={deletingId === dataset.id}
                          className="p-2 hover:bg-status-critical/20 rounded-button transition-colors"
                          title="Delete Dataset"
                        >
                          {deletingId === dataset.id ? (
                            <Loader2 className="w-4 h-4 text-status-critical animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-status-critical" />
                          )}
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Upload Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card max-w-xl w-full p-6 relative border border-brand-purple/50 shadow-2xl bg-background-card"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  if (!uploading) {
                    setIsModalOpen(false);
                    setSelectedFile(null);
                    setErrorMessage('');
                  }
                }}
                disabled={uploading}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-background-secondary text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title */}
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-brand-primary/20 border border-brand-primary/30">
                  <Upload className="w-6 h-6 text-brand-pink" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gradient">Ingest New Dataset</h2>
                  <p className="text-xs text-text-muted">
                    Automated schema profiling, 6D data quality, drift & anomaly detection
                  </p>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`mt-5 border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? 'border-brand-pink bg-brand-primary/20 scale-[1.01]'
                    : 'border-border hover:border-brand-muted bg-background-secondary/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                  id="dataset-file-input"
                />

                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-brand-secondary/80 flex items-center justify-center border border-brand-muted/30">
                  <Upload className="w-7 h-7 text-brand-pink" />
                </div>

                <p className="text-base font-semibold text-text-primary mb-2">
                  Drag & drop dataset here
                </p>
                <p className="text-xs text-text-muted mb-4">
                  Supports CSV, JSON, Excel (.xlsx, .xls) up to 100 MB
                </p>

                {/* Explicit Browse Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={uploading}
                  className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse Files</span>
                </motion.button>
              </div>

              {/* Selected File Card */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-background-secondary border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-brand-primary/20">
                      {getFileIcon(selectedFile.name)}
                    </div>
                    <div className="truncate">
                      <div className="font-medium text-sm text-text-primary truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-text-muted">
                        {formatFileSize(selectedFile.size)} • {selectedFile.name.split('.').pop()?.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {!uploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="p-1.5 hover:bg-status-critical/20 rounded-lg text-text-muted hover:text-status-critical transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-status-critical/15 border border-status-critical/30 flex items-center gap-2.5 text-status-critical text-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-pink" />
                      Uploading & Processing Ingestion Pipeline...
                    </span>
                    <span className="text-brand-pink">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-background-secondary rounded-full overflow-hidden border border-border">
                    <motion.div
                      className="h-full bg-gradient-to-r from-brand-primary via-brand-muted to-brand-pink"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Success Badge */}
              {uploadStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-3 rounded-xl bg-status-healthy/15 border border-status-healthy/30 flex items-center gap-2.5 text-status-healthy text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">
                    Dataset uploaded successfully! ML profiling & anomaly detection triggered.
                  </span>
                </motion.div>
              )}

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={uploading}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUploadSubmit}
                  disabled={!selectedFile || uploading}
                  className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ingesting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Start Live Ingestion</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
