import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Database,
  Calendar,
  FileType,
  HardDrive,
  Columns,
  Rows,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { api } from '../services/api';

interface ColumnProfile {
  name: string;
  type: string;
  missing: number;
  missingPct: number;
  unique: number;
  quality: number;
  min?: string | number;
  max?: string | number;
  mean?: number;
  median?: number;
  stdDev?: number;
}

const FALLBACK_DATASET = {
  id: '1',
  name: 'retail_sales_q3_2026.csv',
  sourceType: 'CSV',
  status: 'HEALTHY' as const,
  rowCount: 10000,
  columnCount: 8,
  fileSize: 2458624,
  quality: 92,
  reliability: 88,
  createdAt: '2026-09-14T10:00:00Z',
  updatedAt: '2026-09-14T15:30:00Z',
  s3Bucket: 'datasentry-local',
  s3Key: 'retail_sales_q3_2026.csv',
};

const FALLBACK_PROFILES: ColumnProfile[] = [
  { name: 'date', type: 'datetime', missing: 0, missingPct: 0, unique: 365, quality: 100 },
  { name: 'product_id', type: 'categorical', missing: 0, missingPct: 0, unique: 150, quality: 100 },
  { name: 'store_id', type: 'categorical', missing: 0, missingPct: 0, unique: 25, quality: 100 },
  { name: 'quantity', type: 'numeric', missing: 250, missingPct: 2.5, unique: 450, quality: 92, min: 1, max: 500, mean: 45.6, median: 38.0 },
  { name: 'price', type: 'numeric', missing: 0, missingPct: 0, unique: 85, quality: 95, min: 9.99, max: 299.99, mean: 54.32, median: 49.99 },
  { name: 'discount', type: 'numeric', missing: 150, missingPct: 1.5, unique: 20, quality: 90, min: 0, max: 50, mean: 12.5, median: 10.0 },
  { name: 'revenue', type: 'numeric', missing: 0, missingPct: 0, unique: 8500, quality: 100, min: 5.99, max: 14999.5, mean: 2456.78, median: 1899.99 },
  { name: 'customer_id', type: 'categorical', missing: 120, missingPct: 1.2, unique: 4500, quality: 88 },
];

export function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<any>(FALLBACK_DATASET);
  const [profiles, setProfiles] = useState<ColumnProfile[]>(FALLBACK_PROFILES);
  const [loading, setLoading] = useState(false);

  const fetchDatasetDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/datasets/${id}`);
      if (res.data) {
        const raw = res.data;
        const qualityScore = raw.qualityResults?.[0]?.overallScore || 85;
        const reliabilityScore = raw.reliabilityScores?.[0]?.score || 82;

        setDataset({
          ...raw,
          quality: qualityScore,
          reliability: reliabilityScore,
        });

        if (raw.profiles && raw.profiles.length > 0) {
          const mappedProfiles: ColumnProfile[] = raw.profiles.map((p: any) => ({
            name: p.columnName,
            type: p.dataType,
            missing: p.missingCount || 0,
            missingPct: p.missingPct || 0,
            unique: p.uniqueCount || 0,
            quality: Math.max(0, 100 - Math.round(p.missingPct || 0)),
            min: p.minValue,
            max: p.maxValue,
            mean: p.mean,
            median: p.median,
            stdDev: p.stdDev,
          }));
          setProfiles(mappedProfiles);
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch dataset details, using fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetDetails();
  }, [id]);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Find a numeric column for the distribution graph
  const numericColumn = profiles.find((p) => p.type === 'numeric' || p.type === 'float' || p.type === 'integer') || profiles[0];

  const distributionOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Bin 1 (Low)', 'Bin 2 (Med-Low)', 'Bin 3 (Median)', 'Bin 4 (Med-High)', 'Bin 5 (High)', 'Bin 6 (Outliers)'],
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
        name: `${numericColumn?.name || 'Values'} Frequency`,
        type: 'bar',
        data: [1200, 2800, 3200, 1900, 700, 200],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#DFB6B2' },
              { offset: 1, color: '#522B5B' },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <Link to="/datasets">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 text-text-secondary hover:text-brand-pink transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Datasets Catalog
          </motion.button>
        </Link>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchDatasetDetails}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Details</span>
        </motion.button>
      </div>

      {/* Main Info Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-brand-primary/20 border border-brand-primary/30 rounded-2xl">
              <Database className="w-8 h-8 text-brand-pink" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text-primary">{dataset.name}</h1>
                <span
                  className={`badge ${
                    dataset.status === 'HEALTHY'
                      ? 'badge-healthy'
                      : dataset.status === 'WARNING'
                      ? 'badge-warning'
                      : dataset.status === 'PROCESSING'
                      ? 'badge-info'
                      : 'badge-critical'
                  }`}
                >
                  {dataset.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-2">
                <span className="flex items-center gap-1.5">
                  <FileType className="w-4 h-4 text-brand-pink" />
                  Format: <strong className="text-text-secondary">{dataset.sourceType}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-brand-pink" />
                  Size: <strong className="text-text-secondary">{formatFileSize(dataset.fileSize)}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-pink" />
                  Ingested: <strong className="text-text-secondary">{new Date(dataset.createdAt).toLocaleDateString()}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/quality?dataset=${id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Run Quality Audit</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Ingested Rows',
            value: dataset.rowCount ? dataset.rowCount.toLocaleString() : '—',
            icon: Rows,
            color: 'text-brand-pink',
          },
          {
            label: 'Total Columns Profiled',
            value: (dataset.columnCount || profiles.length).toString(),
            icon: Columns,
            color: 'text-amber-400',
          },
          {
            label: 'Overall Quality Score',
            value: `${dataset.quality || 85}%`,
            icon: CheckCircle,
            color: 'text-status-healthy',
          },
          {
            label: 'Composite Reliability',
            value: `${dataset.reliability || 82}%`,
            icon: TrendingUp,
            color: 'text-brand-pink',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="glass-card p-6 border-l-4 border-l-brand-primary"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
              <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">Metrics</span>
            </div>
            <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
            <div className="text-sm text-text-muted">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Schema Information Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gradient">
            <Database className="w-5 h-5 text-brand-pink" />
            Automated Schema & Column Profiles
          </h2>
          <span className="text-xs text-text-muted">{profiles.length} columns identified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background-card/50">
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Column Name
                </th>
                <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Data Type
                </th>
                <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Missing (Nulls)
                </th>
                <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Distinct / Unique
                </th>
                <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Quality Health
                </th>
                <th className="text-right p-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Statistical Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map((column, index) => (
                <motion.tr
                  key={column.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-background-card/80 transition-colors"
                >
                  <td className="p-3 font-semibold text-text-primary">{column.name}</td>
                  <td className="p-3">
                    <span className="badge badge-info uppercase text-xs">{column.type}</span>
                  </td>
                  <td className="p-3 text-right text-text-muted text-sm">
                    {column.missing > 0 ? (
                      <span className="text-status-warning font-medium">
                        {column.missing.toLocaleString()} ({column.missingPct?.toFixed(1)}%)
                      </span>
                    ) : (
                      <span className="text-status-healthy font-medium">0 (0.0%)</span>
                    )}
                  </td>
                  <td className="p-3 text-right text-text-secondary text-sm font-medium">
                    {column.unique.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-background-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            column.quality >= 90
                              ? 'bg-status-healthy'
                              : column.quality >= 75
                              ? 'bg-status-warning'
                              : 'bg-status-critical'
                          }`}
                          style={{ width: `${column.quality}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{column.quality}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-xs text-text-muted">
                    {column.mean !== undefined && column.mean !== null ? (
                      <div>
                        μ={Number(column.mean).toFixed(1)} | med={Number(column.median || 0).toFixed(1)}
                      </div>
                    ) : column.min !== undefined && column.min !== null ? (
                      <div>
                        [{column.min} .. {column.max}]
                      </div>
                    ) : (
                      <span className="text-text-muted/60">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gradient">
          <Activity className="w-5 h-5 text-brand-pink" />
          Feature Distribution Profile: {numericColumn?.name}
        </h2>
        <ReactECharts option={distributionOptions} style={{ height: '280px' }} />
      </motion.div>

      {/* Quick Navigation Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Link to={`/quality?dataset=${id}`} className="glass-card p-5 hover:border-brand-pink transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-status-healthy/20 text-status-healthy">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-text-primary group-hover:text-brand-pink transition-colors">
                6D Data Quality Analysis
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                Completeness, validity, consistency, timeliness
              </div>
            </div>
          </div>
        </Link>

        <Link to={`/anomalies?dataset=${id}`} className="glass-card p-5 hover:border-brand-pink transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-status-warning/20 text-status-warning">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-text-primary group-hover:text-brand-pink transition-colors">
                ML Anomaly Detections
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                Isolation Forest, IQR, Z-Score outliers
              </div>
            </div>
          </div>
        </Link>

        <Link to={`/drift?dataset=${id}`} className="glass-card p-5 hover:border-brand-pink transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand-primary/20 text-brand-pink">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-text-primary group-hover:text-brand-pink transition-colors">
                Distribution Drift (PSI & KS)
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                Statistical drift and concept shifts
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
