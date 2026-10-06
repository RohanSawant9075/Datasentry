import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  TrendingUp,
  Filter,
  RefreshCw,
  Loader2,
  Check,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_ALERTS = [
  {
    id: '1',
    title: 'Critical Distribution Drift Detected',
    description: 'Quantity feature exhibits PSI score of 0.45 — significant shift from baseline distribution',
    severity: 'CRITICAL',
    category: 'DRIFT',
    status: 'UNREAD',
    dataset: 'retail_sales_q3_2026.csv',
    timestamp: '2026-09-14 14:23:00',
    affected_rows: 15000,
    recommendation: 'Trigger automated retraining or inspect upstream ingestion stream for format changes.',
  },
  {
    id: '2',
    title: 'High Anomaly Rate in Price Column',
    description: '145 statistical anomalies isolated by Isolation Forest (|z| > 3.2)',
    severity: 'HIGH',
    category: 'ANOMALY',
    status: 'ACKNOWLEDGED',
    dataset: 'retail_sales_q3_2026.csv',
    timestamp: '2026-09-14 12:45:00',
    affected_rows: 145,
    recommendation: 'Review point-of-sale pricing inputs for decimal shifting or unit-of-measure mismatch.',
  },
  {
    id: '3',
    title: 'Quality Score Dropped Below Threshold',
    description: 'Composite quality score declined to 76.5% against 85.0% SLO target',
    severity: 'HIGH',
    category: 'QUALITY',
    status: 'UNREAD',
    dataset: 'sensor_readings_with_anomalies.csv',
    timestamp: '2026-09-14 11:20:00',
    affected_rows: null,
    recommendation: 'Execute 6D quality audit to isolate validity and consistency rule violations.',
  },
  {
    id: '4',
    title: 'Outlier Spike Detected in Voltage',
    description: 'Sensor voltage registered negative values (-5.20V) outside physical tolerances',
    severity: 'CRITICAL',
    category: 'ANOMALY',
    status: 'UNREAD',
    dataset: 'sensor_readings_with_anomalies.csv',
    timestamp: '2026-09-14 10:15:00',
    affected_rows: 18,
    recommendation: 'Check power supply hardware and verify sensor telemetry transceiver integrity.',
  },
  {
    id: '5',
    title: 'Completeness Violation Ingested',
    description: '250 missing values observed in quantity field during batch ingest',
    severity: 'MEDIUM',
    category: 'QUALITY',
    status: 'ACKNOWLEDGED',
    dataset: 'retail_sales_q3_2026.csv',
    timestamp: '2026-09-14 09:30:00',
    affected_rows: 250,
    recommendation: 'Apply automated forward-fill or median imputation rules.',
  },
  {
    id: '6',
    title: 'Baseline Check Passed',
    description: 'Weekly quality assessment completed for clean baseline datasets',
    severity: 'LOW',
    category: 'SYSTEM',
    status: 'RESOLVED',
    dataset: 'retail_sales_clean.csv',
    timestamp: '2026-09-14 08:00:00',
    affected_rows: null,
    recommendation: null,
  },
];

export function Alerts() {
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [alerts, setAlerts] = useState<any[]>(DEFAULT_ALERTS);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 6,
    critical: 2,
    high: 2,
    medium: 1,
    low: 1,
    unread: 3,
    acknowledged: 2,
    resolved: 1,
  });

  const fetchAlertsData = async () => {
    try {
      setLoading(true);
      const [alertsRes, statsRes] = await Promise.allSettled([
        api.get('/alerts'),
        api.get('/alerts/stats'),
      ]);

      if (alertsRes.status === 'fulfilled' && alertsRes.value?.data) {
        const data = alertsRes.value.data;
        const list = Array.isArray(data) ? data : data.data || [];
        if (list.length > 0) {
          setAlerts(
            list.map((a: any) => ({
              id: a.id,
              title: a.title,
              description: a.message || a.description,
              severity: a.severity || 'MEDIUM',
              category: a.category || a.type || 'SYSTEM',
              status: a.status || (a.isRead ? 'RESOLVED' : 'UNREAD'),
              dataset: a.dataset?.name || a.datasetName || 'Active Ingestion Pipeline',
              timestamp: a.createdAt ? new Date(a.createdAt).toLocaleString() : 'Recent',
              affected_rows: a.affectedRows || a.affected_rows || null,
              recommendation: a.recommendation || null,
            }))
          );
        }
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setStats(statsRes.value.data);
      }
    } catch (err: any) {
      console.warn('Using default alerts data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      setActionId(id);
      await api.patch(`/alerts/${id}/acknowledge`);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
      setStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        acknowledged: prev.acknowledged + 1,
      }));
    } catch (err: any) {
      console.error('Acknowledge failed:', err);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    } finally {
      setActionId(null);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      setActionId(id);
      await api.patch(`/alerts/${id}/resolve`);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
      );
      setStats((prev) => ({
        ...prev,
        acknowledged: Math.max(0, prev.acknowledged - 1),
        resolved: prev.resolved + 1,
      }));
    } catch (err: any) {
      console.error('Resolve failed:', err);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'RESOLVED' } : a))
      );
    } finally {
      setActionId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/alerts/mark-all-read');
      setAlerts((prev) =>
        prev.map((a) => (a.status === 'UNREAD' ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
      setStats((prev) => ({
        ...prev,
        acknowledged: prev.acknowledged + prev.unread,
        unread: 0,
      }));
    } catch (err: any) {
      console.error('Mark all read failed:', err);
      setAlerts((prev) =>
        prev.map((a) => (a.status === 'UNREAD' ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedSeverity !== 'ALL' && alert.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && alert.status !== selectedStatus) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-status-critical';
      case 'HIGH':
        return 'text-status-warning';
      case 'MEDIUM':
        return 'text-blue-400';
      case 'LOW':
        return 'text-text-muted';
      default:
        return 'text-text-secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DRIFT':
        return TrendingUp;
      case 'ANOMALY':
        return AlertCircle;
      case 'QUALITY':
        return Zap;
      case 'MODEL':
        return Info;
      default:
        return Bell;
    }
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
          <h1 className="text-3xl font-bold text-gradient mb-2">Automated Alerts & Telemetry</h1>
          <p className="text-text-secondary">
            Real-time incident dispatching for quality degradations, statistical drift & anomaly spikes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAlertsData}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleMarkAllRead}
            className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-brand-primary/20"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Acknowledge All</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 border-l-4 border-l-brand-primary"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-muted">Total Active Alerts</div>
            <Bell className="w-5 h-5 text-brand-pink" />
          </div>
          <div className="text-3xl font-extrabold">{alerts.length}</div>
          <div className="text-xs text-text-secondary mt-1">{stats.unread} unread incidents</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 border-l-4 border-l-status-critical"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-muted">Critical Incidents</div>
            <AlertCircle className="w-5 h-5 text-status-critical" />
          </div>
          <div className="text-3xl font-extrabold text-status-critical">
            {alerts.filter((a) => a.severity === 'CRITICAL').length}
          </div>
          <div className="text-xs text-status-critical mt-1">Immediate action required</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 border-l-4 border-l-status-warning"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-muted">Investigating</div>
            <Info className="w-5 h-5 text-status-warning" />
          </div>
          <div className="text-3xl font-extrabold">
            {alerts.filter((a) => a.status === 'ACKNOWLEDGED').length}
          </div>
          <div className="text-xs text-text-secondary mt-1">In triage workflow</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6 border-l-4 border-l-status-healthy"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-muted">Resolved Clean</div>
            <CheckCircle className="w-5 h-5 text-status-healthy" />
          </div>
          <div className="text-3xl font-extrabold text-status-healthy">
            {alerts.filter((a) => a.status === 'RESOLVED').length}
          </div>
          <div className="text-xs text-status-healthy mt-1">Audit trail archived</div>
        </motion.div>
      </div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-brand-pink" />
          <span className="text-xs font-semibold text-text-secondary">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-background-secondary border border-border px-3 py-1 rounded-lg text-xs text-text-primary focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <span className="text-xs font-semibold text-text-secondary ml-2">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-background-secondary border border-border px-3 py-1 rounded-lg text-xs text-text-primary focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNREAD">Unread</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="text-xs text-text-muted">
          Showing <span className="text-brand-pink font-semibold">{filteredAlerts.length}</span> matching incidents
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert, index) => {
          const CategoryIcon = getCategoryIcon(alert.category);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.04 }}
              className={`glass-card p-6 border-l-4 ${
                alert.severity === 'CRITICAL'
                  ? 'border-l-status-critical'
                  : alert.severity === 'HIGH'
                  ? 'border-l-status-warning'
                  : 'border-l-brand-primary'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-status-critical/20'
                      : alert.severity === 'HIGH'
                      ? 'bg-status-warning/20'
                      : 'bg-brand-primary/20'
                  }`}
                >
                  <CategoryIcon className={`w-5 h-5 ${getSeverityColor(alert.severity)}`} />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-bold text-text-primary">{alert.title}</h3>
                      <span
                        className={`badge ${
                          alert.severity === 'CRITICAL'
                            ? 'badge-critical'
                            : alert.severity === 'HIGH'
                            ? 'badge-warning'
                            : 'badge-info'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="badge badge-info">{alert.category}</span>
                      <span
                        className={`badge ${
                          alert.status === 'RESOLVED'
                            ? 'badge-healthy'
                            : alert.status === 'ACKNOWLEDGED'
                            ? 'badge-warning'
                            : 'badge-critical'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">{alert.timestamp}</span>
                  </div>

                  <p className="text-sm text-text-secondary mb-3">{alert.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mb-3">
                    <div>
                      Dataset: <code className="text-brand-pink font-semibold bg-background-secondary px-1.5 py-0.5 rounded">{alert.dataset}</code>
                    </div>
                    {alert.affected_rows && (
                      <div>
                        Rows Affected: <span className="text-text-primary font-semibold">{alert.affected_rows.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {alert.recommendation && (
                    <div className="p-3 bg-background-secondary rounded-lg border border-border text-xs flex items-start gap-2 mb-3">
                      <Zap className="w-4 h-4 text-brand-pink mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-text-primary">Recommended Remediation: </span>
                        <span className="text-text-secondary">{alert.recommendation}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    {alert.status === 'UNREAD' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={actionId === alert.id}
                        className="btn-secondary text-xs flex items-center gap-1.5"
                      >
                        {actionId === alert.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Info className="w-3.5 h-3.5 text-status-warning" />
                        )}
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {alert.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={actionId === alert.id}
                        className="btn-primary text-xs flex items-center gap-1.5"
                      >
                        {actionId === alert.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Mark Resolved</span>
                      </button>
                    )}

                    {alert.status === 'RESOLVED' && (
                      <span className="text-xs text-status-healthy font-semibold flex items-center gap-1 px-3 py-1 rounded-full bg-status-healthy/10">
                        <Check className="w-3.5 h-3.5" />
                        Resolved & Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center"
        >
          <CheckCircle className="w-16 h-16 text-status-healthy mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Incidents Matching Filters</h3>
          <p className="text-text-muted">All active telemetry metrics within expected tolerance thresholds.</p>
        </motion.div>
      )}
    </div>
  );
}
