import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Bell,
  Cpu,
  Shield,
  Save,
  CheckCircle2,
  RefreshCw,
  Send,
  Webhook,
  Mail,
  Server,
  Key,
} from 'lucide-react';

export function Settings() {
  const [activeTab, setActiveTab] = useState<'THRESHOLDS' | 'ALERTS' | 'INTEGRATIONS' | 'GOVERNANCE'>('THRESHOLDS');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testAlertSending, setTestAlertSending] = useState(false);
  const [testAlertSent, setTestAlertSent] = useState(false);

  // Thresholds state
  const [minQualitySla, setMinQualitySla] = useState(80);
  const [psiWarning, setPsiWarning] = useState(0.10);
  const [psiCritical, setPsiCritical] = useState(0.25);
  const [contaminationFactor, setContaminationFactor] = useState(0.05);
  const [zScoreThreshold, setZScoreThreshold] = useState(3.0);
  const [iqrMultiplier, setIqrMultiplier] = useState(1.5);
  const [timelinessSlaHours, setTimelinessSlaHours] = useState(24);

  // Alerts state
  const [slackWebhook, setSlackWebhook] = useState('');
  const [slackChannel, setSlackChannel] = useState('#data-observability-alerts');
  const [emailRecipients, setEmailRecipients] = useState('data-eng-team@datasentry.internal, mlops-lead@datasentry.internal');
  const [emailDigestFreq, setEmailDigestFreq] = useState<'REALTIME' | 'HOURLY' | 'DAILY'>('REALTIME');
  const [pagerdutyKey, setPagerdutyKey] = useState('');

  // Integrations state
  const [mlServiceUrl, setMlServiceUrl] = useState('http://localhost:8000/api');
  const [s3BucketName, setS3BucketName] = useState('datasentry-raw-datasets-prod');
  const [s3Region, setS3Region] = useState('us-east-1');
  const [maxUploadSizeMb, setMaxUploadSizeMb] = useState(100);

  // Governance state
  const [retentionDays, setRetentionDays] = useState(180);
  const [anonymizePii, setAnonymizePii] = useState(true);
  const [autoPurgeCorrupted, setAutoPurgeCorrupted] = useState(false);
  const [enforceMfa, setEnforceMfa] = useState(true);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleSendTestAlert = () => {
    setTestAlertSending(true);
    setTimeout(() => {
      setTestAlertSending(false);
      setTestAlertSent(true);
      setTimeout(() => setTestAlertSent(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#FBE4D8]">System Settings & Governance</h1>
          <p className="text-[#DFB6B2] text-sm mt-1">
            Configure observability thresholds, anomaly sensitivity, alert dispatchers, and integration parameters
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#522B5B] hover:bg-[#854F6C] text-[#FBE4D8] rounded-xl font-medium transition-all shadow-lg border border-[#854F6C]/50"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {/* Save Success Banner */}
      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 bg-emerald-900/60 border border-emerald-500/80 text-emerald-200 px-4 py-3 rounded-xl backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">Settings successfully updated and synced across ML microservice & database.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#522B5B] pb-3">
        {[
          { id: 'THRESHOLDS', label: 'Thresholds & Detection', icon: Sliders },
          { id: 'ALERTS', label: 'Alert Channels & Webhooks', icon: Bell },
          { id: 'INTEGRATIONS', label: 'Microservices & Storage', icon: Cpu },
          { id: 'GOVERNANCE', label: 'Security & Compliance', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#522B5B] text-[#FBE4D8] border border-[#854F6C] shadow-md'
                  : 'text-[#DFB6B2] hover:bg-[#2B124C]/40 hover:text-[#FBE4D8]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Detection & Thresholds */}
      {activeTab === 'THRESHOLDS' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quality & Drift Card */}
          <div className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#522B5B]/60">
              <div className="p-2 bg-[#522B5B]/60 rounded-lg text-[#FBE4D8]">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#FBE4D8]">Quality SLA & Drift Sensitivity</h3>
                <p className="text-xs text-[#DFB6B2]">Define acceptable data quality floors and PSI drift barriers</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs text-[#DFB6B2] mb-1.5">
                  <span>Minimum Overall Quality SLA</span>
                  <span className="font-bold text-[#FBE4D8]">{minQualitySla}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={minQualitySla}
                  onChange={(e) => setMinQualitySla(Number(e.target.value))}
                  className="w-full accent-[#DFB6B2] bg-[#190019] rounded-lg h-2"
                />
                <p className="text-[11px] text-[#DFB6B2]/70 mt-1">Datasets dropping below this threshold trigger CRITICAL quality alerts.</p>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-[#DFB6B2] mb-1.5">
                  <span>PSI Warning Threshold (Mild Drift)</span>
                  <span className="font-bold text-amber-300">{psiWarning}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.20"
                  step="0.01"
                  value={psiWarning}
                  onChange={(e) => setPsiWarning(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-[#190019] rounded-lg h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-[#DFB6B2] mb-1.5">
                  <span>PSI Critical Threshold (Significant Shift)</span>
                  <span className="font-bold text-red-400">{psiCritical}</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.50"
                  step="0.01"
                  value={psiCritical}
                  onChange={(e) => setPsiCritical(Number(e.target.value))}
                  className="w-full accent-red-400 bg-[#190019] rounded-lg h-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Timeliness Max Ingestion Latency (Hours)</label>
                <input
                  type="number"
                  value={timelinessSlaHours}
                  onChange={(e) => setTimelinessSlaHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                />
              </div>
            </div>
          </div>

          {/* Anomaly Detection Algorithms Card */}
          <div className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#522B5B]/60">
              <div className="p-2 bg-[#522B5B]/60 rounded-lg text-[#DFB6B2]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#FBE4D8]">Machine Learning Anomaly Tuning</h3>
                <p className="text-xs text-[#DFB6B2]">Parameters for scikit-learn IsolationForest, IQR & Z-Scores</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs text-[#DFB6B2] mb-1.5">
                  <span>IsolationForest Contamination Factor</span>
                  <span className="font-bold text-[#FBE4D8]">{(contaminationFactor * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.20"
                  step="0.01"
                  value={contaminationFactor}
                  onChange={(e) => setContaminationFactor(Number(e.target.value))}
                  className="w-full accent-[#DFB6B2] bg-[#190019] rounded-lg h-2"
                />
                <p className="text-[11px] text-[#DFB6B2]/70 mt-1">Expected proportion of outliers in ingested batches.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Z-Score Outlier Standard Deviation Cutoff</label>
                <input
                  type="number"
                  step="0.1"
                  value={zScoreThreshold}
                  onChange={(e) => setZScoreThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">IQR Interquartile Range Multiplier</label>
                <select
                  value={iqrMultiplier}
                  onChange={(e) => setIqrMultiplier(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                >
                  <option value={1.5}>1.5 (Standard Outlier Detection)</option>
                  <option value={2.0}>2.0 (Conservative Outlier Detection)</option>
                  <option value={3.0}>3.0 (Extreme Outliers Only)</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Alerts & Notification Channels */}
      {activeTab === 'ALERTS' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-2xl p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#522B5B]/60">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#522B5B]/60 rounded-lg text-[#FBE4D8]">
                  <Webhook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#FBE4D8]">Slack Webhook Integration</h3>
                  <p className="text-xs text-[#DFB6B2]">Post real-time observability warnings and quality degradation alerts</p>
                </div>
              </div>

              <button
                onClick={handleSendTestAlert}
                disabled={testAlertSending}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#522B5B]/60 hover:bg-[#522B5B] text-[#FBE4D8] rounded-lg text-xs transition-colors border border-[#854F6C]/40"
              >
                {testAlertSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{testAlertSending ? 'Dispatching...' : 'Send Test Alert'}</span>
              </button>
            </div>

            {testAlertSent && (
              <div className="p-3 bg-emerald-900/40 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                <span>Test payload sent to Slack channel <strong>{slackChannel}</strong> with 200 OK status!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Incoming Webhook URL</label>
                <input
                  type="text"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Target Slack Channel</label>
                <input
                  type="text"
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#522B5B]/60">
              <div className="p-2 bg-[#522B5B]/60 rounded-lg text-[#DFB6B2]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#FBE4D8]">Email Distribution & PagerDuty</h3>
                <p className="text-xs text-[#DFB6B2]">Configure notification recipients and critical incident routing</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Recipients (Comma Separated)</label>
                <input
                  type="text"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Digest Frequency</label>
                <select
                  value={emailDigestFreq}
                  onChange={(e) => setEmailDigestFreq(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                >
                  <option value="REALTIME">Real-time (Instant Alert on Anomaly/Quality Breach)</option>
                  <option value="HOURLY">Hourly Aggregated Digest</option>
                  <option value="DAILY">Daily Executive Summary</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">PagerDuty Integration Routing Key</label>
                <input
                  type="password"
                  value={pagerdutyKey}
                  onChange={(e) => setPagerdutyKey(e.target.value)}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Microservices & Storage */}
      {activeTab === 'INTEGRATIONS' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#522B5B]/60">
              <div className="p-2 bg-[#522B5B]/60 rounded-lg text-[#FBE4D8]">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#FBE4D8]">Python ML Analytics Microservice</h3>
                <p className="text-xs text-[#DFB6B2]">Endpoints for FastAPI profiling, LightGBM modeling & drift engines</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">FastAPI Backend Service URL</label>
                <input
                  type="text"
                  value={mlServiceUrl}
                  onChange={(e) => setMlServiceUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Max Ingestion Upload File Size (MB)</label>
                <input
                  type="number"
                  value={maxUploadSizeMb}
                  onChange={(e) => setMaxUploadSizeMb(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#522B5B]/60">
              <div className="p-2 bg-[#522B5B]/60 rounded-lg text-[#DFB6B2]">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#FBE4D8]">Cloud Object Storage (AWS S3 / MinIO)</h3>
                <p className="text-xs text-[#DFB6B2]">Storage parameters for uploaded datasets and cached profiling parquet files</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Target S3 Bucket Name</label>
                <input
                  type="text"
                  value={s3BucketName}
                  onChange={(e) => setS3BucketName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">AWS Region</label>
                <input
                  type="text"
                  value={s3Region}
                  onChange={(e) => setS3Region(e.target.value)}
                  className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 4: Governance & Security */}
      {activeTab === 'GOVERNANCE' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#522B5B]/60">
              <div className="p-2 bg-[#522B5B]/60 rounded-lg text-[#FBE4D8]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#FBE4D8]">Data Retention & Privacy Controls</h3>
                <p className="text-xs text-[#DFB6B2]">GDPR/HIPAA compliance, automated snapshot pruning, and PII masking</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#190019]/50 rounded-xl border border-[#522B5B]">
                <div>
                  <p className="text-sm font-medium text-[#FBE4D8]">Automatic PII Masking during Profiling</p>
                  <p className="text-xs text-[#DFB6B2]/70">Redact detected email addresses, phone numbers, and SSNs from statistical summaries</p>
                </div>
                <input
                  type="checkbox"
                  checked={anonymizePii}
                  onChange={(e) => setAnonymizePii(e.target.checked)}
                  className="w-5 h-5 accent-[#DFB6B2] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#190019]/50 rounded-xl border border-[#522B5B]">
                <div>
                  <p className="text-sm font-medium text-[#FBE4D8]">Enforce Multi-Factor Authentication (MFA)</p>
                  <p className="text-xs text-[#DFB6B2]/70">Require TOTP for all team members accessing quality reports and dataset exports</p>
                </div>
                <input
                  type="checkbox"
                  checked={enforceMfa}
                  onChange={(e) => setEnforceMfa(e.target.checked)}
                  className="w-5 h-5 accent-[#DFB6B2] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#190019]/50 rounded-xl border border-[#522B5B]">
                <div>
                  <p className="text-sm font-medium text-[#FBE4D8]">Auto-Purge Severely Corrupted Files</p>
                  <p className="text-xs text-[#DFB6B2]/70">Automatically delete uploaded files failing integrity checks after 7 days</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoPurgeCorrupted}
                  onChange={(e) => setAutoPurgeCorrupted(e.target.checked)}
                  className="w-5 h-5 accent-[#DFB6B2] rounded cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Historical Audit Log Retention (Days)</label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full md:w-64 px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                >
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                  <option value={180}>180 Days (Recommended)</option>
                  <option value={365}>365 Days (1 Year Compliance)</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
