import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Filter,
  Play,
  Database,
  RefreshCw,
  Loader2,
  Check,
  Zap,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

const DEFAULT_ANOMALIES = [
  {
    id: '1',
    columnName: 'quantity',
    anomalyType: 'Statistical Outlier',
    method: 'IsolationForest',
    severity: 'CRITICAL' as const,
    affectedCount: 15,
    detectedAt: '2026-09-14 14:23:00',
    explanation: 'Extreme values detected: 15 rows with quantity > 10,000',
    status: 'ACTIVE',
  },
  {
    id: '2',
    columnName: 'price',
    anomalyType: 'Distribution Shift',
    method: 'Z-Score',
    severity: 'HIGH' as const,
    affectedCount: 23,
    detectedAt: '2026-09-14 12:45:00',
    explanation: 'Price values shifted to lower range unexpectedly (|z| > 3.2)',
    status: 'ACTIVE',
  },
  {
    id: '3',
    columnName: 'revenue',
    anomalyType: 'Point Anomaly',
    method: 'IQR',
    severity: 'HIGH' as const,
    affectedCount: 8,
    detectedAt: '2026-09-14 11:20:00',
    explanation: 'Negative revenue values detected outside 1.5x IQR boundaries',
    status: 'INVESTIGATING',
  },
  {
    id: '4',
    columnName: 'discount',
    anomalyType: 'Pattern Anomaly',
    method: 'IsolationForest',
    severity: 'MEDIUM' as const,
    affectedCount: 34,
    detectedAt: '2026-09-14 10:15:00',
    explanation: 'Unusual discount pattern: clusters of 100% discounts',
    status: 'ACTIVE',
  },
  {
    id: '5',
    columnName: 'date',
    anomalyType: 'Temporal Anomaly',
    method: 'Time Series',
    severity: 'LOW' as const,
    affectedCount: 12,
    detectedAt: '2026-09-14 09:30:00',
    explanation: 'Future dates detected in historical sales record batch',
    status: 'RESOLVED',
  },
];

export function Anomalies() {
  const [searchParams] = useSearchParams();
  const initialDatasetId = searchParams.get('dataset') || '';

  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(initialDatasetId);
  const [anomalies, setAnomalies] = useState<any[]>(DEFAULT_ANOMALIES);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Load datasets
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get('/datasets');
        if (res.data?.data && res.data.data.length > 0) {
          setDatasets(res.data.data);
          if (!selectedDatasetId) {
            setSelectedDatasetId(res.data.data[0].id);
          }
        }
      } catch (err: any) {
        console.warn('Could not load datasets:', err.message);
      }
    };
    fetchDatasets();
  }, []);

  // Fetch anomalies for dataset
  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      let res;
      if (selectedDatasetId) {
        res = await api.get(`/anomalies/dataset/${selectedDatasetId}`);
      } else {
        res = await api.get('/anomalies');
      }

      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setAnomalies(res.data);
      } else {
        setAnomalies(DEFAULT_ANOMALIES);
      }
    } catch (err: any) {
      console.warn('Could not load anomalies, using default list:', err.message);
      setAnomalies(DEFAULT_ANOMALIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [selectedDatasetId]);

  const handleDetect = async () => {
    if (!selectedDatasetId) return;
    try {
      setDetecting(true);
      await api.post(`/anomalies/detect/${selectedDatasetId}`, { contamination: 0.05 });
      await fetchAnomalies();
    } catch (err: any) {
      console.error('Detection failed:', err);
    } finally {
      setDetecting(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      setResolvingId(id);
      await api.patch(`/anomalies/${id}/resolve`);
      setAnomalies((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
      );
    } catch (err: any) {
      console.error('Resolve failed:', err);
      setAnomalies((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
      );
    } finally {
      setResolvingId(null);
    }
  };

  const filteredAnomalies = anomalies.filter((a) => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    return true;
  });

  const criticalCount = anomalies.filter((a) => a.severity === 'CRITICAL').length;
  const highCount = anomalies.filter((a) => a.severity === 'HIGH').length;
  const resolvedCount = anomalies.filter((a) => a.status === 'RESOLVED').length;

  const timelineOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
    },
    legend: {
      data: ['Isolation Forest', 'Z-Score', 'IQR Rule'],
      textStyle: { color: '#DFB6B2' },
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '12%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#DFB6B2' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#DFB6B2' },
      splitLine: { lineStyle: { color: '#2B124C', type: 'dashed' } },
    },
    series: [
      {
        name: 'Isolation Forest',
        type: 'line',
        smooth: true,
        data: [2, 5, 8, 14, 9, 4],
        lineStyle: { color: '#DFB6B2', width: 2 },
        itemStyle: { color: '#DFB6B2' },
      },
      {
        name: 'Z-Score',
        type: 'line',
        smooth: true,
        data: [1, 2, 4, 8, 6, 2],
        lineStyle: { color: '#854F6C', width: 2 },
        itemStyle: { color: '#854F6C' },
      },
      {
        name: 'IQR Rule',
        type: 'line',
        smooth: true,
        data: [0, 1, 3, 5, 4, 1],
        lineStyle: { color: '#522B5B', width: 2 },
        itemStyle: { color: '#522B5B' },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Live Anomaly Engine</h1>
          <p className="text-text-secondary">
            Multi-model anomaly detection using Isolation Forest, IQR thresholds & Z-Scores
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dataset Selector */}
          <div className="flex items-center gap-2 glass-card px-3 py-1.5 border border-border">
            <Database className="w-4 h-4 text-brand-pink" />
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="bg-transparent text-sm text-text-primary focus:outline-none cursor-pointer"
            >
              {datasets.length === 0 ? (
                <option value="">retail_sales_q3_2026.csv</option>
              ) : (
                datasets.map((d) => (
                  <option key={d.id} value={d.id} className="bg-background-card">
                    {d.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDetect}
            disabled={detecting || loading}
            className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-brand-primary/20"
          >
            {detecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Models...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Trigger Detection</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Flagged Outliers', value: anomalies.length.toString(), icon: AlertTriangle, color: 'text-brand-pink' },
          { label: 'Critical Severity', value: criticalCount.toString(), icon: AlertTriangle, color: 'text-status-critical' },
          { label: 'High Severity', value: highCount.toString(), icon: Zap, color: 'text-status-warning' },
          { label: 'Resolved Anomalies', value: resolvedCount.toString(), icon: CheckCircle, color: 'text-status-healthy' },
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

      {/* Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gradient">
          <TrendingUp className="w-5 h-5 text-brand-pink" />
          Anomaly Detection Timeline by Algorithm
        </h2>
        <ReactECharts option={timelineOptions} style={{ height: '280px' }} />
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-brand-pink" />
          <span className="text-sm font-semibold text-text-secondary">Filter Severity:</span>
          <div className="flex gap-2">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-brand-primary text-white'
                    : 'bg-background-secondary text-text-muted hover:text-text-primary'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <button onClick={fetchAnomalies} className="btn-secondary text-xs flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </motion.div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies.map((anomaly, index) => (
          <motion.div
            key={anomaly.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.04 }}
            className={`glass-card p-6 border-l-4 ${
              anomaly.severity === 'CRITICAL'
                ? 'border-l-status-critical'
                : anomaly.severity === 'HIGH'
                ? 'border-l-status-warning'
                : 'border-l-brand-primary'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`badge ${
                      anomaly.severity === 'CRITICAL'
                        ? 'badge-critical'
                        : anomaly.severity === 'HIGH'
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}
                  >
                    {anomaly.severity}
                  </span>
                  <span className="badge badge-info">{anomaly.method}</span>
                  <span className="text-sm font-bold text-text-primary">
                    Column: <code className="text-brand-pink px-1.5 py-0.5 rounded bg-background-secondary">{anomaly.columnName || anomaly.column}</code>
                  </span>
                </div>

                <p className="text-sm font-medium text-text-primary mb-1">
                  {anomaly.explanation || anomaly.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span>{anomaly.affectedCount || anomaly.affected_rows || 1} rows affected</span>
                  <span>•</span>
                  <span>Detected: {new Date(anomaly.detectedAt || anomaly.detected_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {anomaly.status === 'RESOLVED' ? (
                  <span className="text-xs text-status-healthy font-semibold flex items-center gap-1 px-3 py-1.5 rounded-full bg-status-healthy/10">
                    <Check className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleResolve(anomaly.id)}
                    disabled={resolvingId === anomaly.id}
                    className="btn-secondary text-xs flex items-center gap-1.5"
                  >
                    {resolvingId === anomaly.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-status-healthy" />
                    )}
                    <span>Mark Resolved</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
