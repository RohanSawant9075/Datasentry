import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  CheckCircle,
  Database,
  Filter,
  Eye,
  Trash2,
  X,
  FileCheck,
  Zap,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useNotificationStore } from '../stores/notificationStore';
import { api } from '../services/api';

interface ReportItem {
  id: string;
  title: string;
  reportType: 'QUALITY' | 'MODEL_IMPACT' | 'DRIFT_AUDIT' | 'EXECUTIVE_SUMMARY';
  datasetName: string;
  generatedAt: string;
  format: 'JSON' | 'PDF' | 'CSV';
  qualityScore: number;
  reliabilityScore: number;
  anomaliesFound: number;
  driftStatus: string;
  summary: string;
  recommendations: string[];
}

export function Reports() {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const { addNotification } = useNotificationStore();

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDataset, setNewDataset] = useState('retail_transactions_2026.csv');
  const [newType, setNewType] = useState<'QUALITY' | 'MODEL_IMPACT' | 'DRIFT_AUDIT' | 'EXECUTIVE_SUMMARY'>('QUALITY');

  const [reports, setReports] = useState<ReportItem[]>([
    {
      id: 'rep-001',
      title: 'Q3 Retail Sales - Data Quality Audit',
      reportType: 'QUALITY',
      datasetName: 'retail_transactions_2026.csv',
      generatedAt: '2026-09-24 14:30',
      format: 'PDF',
      qualityScore: 88.4,
      reliabilityScore: 85.0,
      anomaliesFound: 14,
      driftStatus: 'Low (PSI 0.08)',
      summary: 'Comprehensive quality evaluation across 6 dimensions. Minor missingness in discount column; unit_price distribution remains stable.',
      recommendations: [
        'Impute missing values in discount column with category median',
        'Verify sensor feed for 14 outlier price transactions',
        'Maintain current automated ETL validation thresholds',
      ],
    },
    {
      id: 'rep-002',
      title: 'Demand Forecast Model Impact Assessment',
      reportType: 'MODEL_IMPACT',
      datasetName: 'product_inventory_v2.csv',
      generatedAt: '2026-09-22 09:15',
      format: 'JSON',
      qualityScore: 76.2,
      reliabilityScore: 71.5,
      anomaliesFound: 38,
      driftStatus: 'Moderate (PSI 0.18)',
      summary: 'Quantification of model performance degradation under 15% synthetic and real noise. Forecast MAE increased from 8.2 to 14.8.',
      recommendations: [
        'Apply feature cleaning pipeline before feeding inference batch',
        'Retrain LightGBM forecasting model with updated feature weights',
        'Enable automated alert triggers on prediction confidence dips below 80%',
      ],
    },
    {
      id: 'rep-003',
      title: 'Supply Chain Drift & Reliability Synthesis',
      reportType: 'DRIFT_AUDIT',
      datasetName: 'supply_chain_metrics.csv',
      generatedAt: '2026-09-18 16:45',
      format: 'PDF',
      qualityScore: 92.1,
      reliabilityScore: 94.0,
      anomaliesFound: 3,
      driftStatus: 'Healthy (PSI 0.03)',
      summary: 'Multi-variable drift check against baseline snapshot. No significant statistical shifts detected in lead-time or fulfillment latency.',
      recommendations: [
        'Baseline snapshot confirmed reliable for subsequent quarterly cycles',
        'Continue periodic weekly drift scans',
      ],
    },
    {
      id: 'rep-004',
      title: 'Executive Data Governance & ROI Summary',
      reportType: 'EXECUTIVE_SUMMARY',
      datasetName: 'all_production_datasets',
      generatedAt: '2026-09-15 11:00',
      format: 'PDF',
      qualityScore: 85.6,
      reliabilityScore: 83.5,
      anomaliesFound: 55,
      driftStatus: 'Controlled',
      summary: 'High-level synthesis for stakeholders: prevented an estimated $125,000 revenue loss by flagging corrupted pricing inputs before batch decisioning.',
      recommendations: [
        'Scale DataSentry-AI coverage to 4 additional regional telemetry pipelines',
        'Formalize weekly executive automated reporting cadence',
      ],
    },
  ]);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: ReportItem = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      title: newTitle || `${newType.replace('_', ' ')} Report - ${newDataset}`,
      reportType: newType,
      datasetName: newDataset,
      generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      format: 'PDF',
      qualityScore: 86.5,
      reliabilityScore: 84.0,
      anomaliesFound: Math.floor(Math.random() * 20) + 5,
      driftStatus: 'Low (PSI 0.09)',
      summary: `Automated assessment generated for ${newDataset}. System completed 6-dimension quality review, statistical anomaly screening, and reliability scoring.`,
      recommendations: [
        'Review highlighted anomalies in dataset detail view',
        'Ensure continuous drift tracking is active for this pipeline',
      ],
    };

    setReports([newReport, ...reports]);
    setIsGenerateModalOpen(false);
    setNewTitle('');

    // Show success notification
    addNotification({
      title: 'Report Generated',
      message: `${newReport.title} has been successfully generated.`,
      type: 'success',
      link: '/reports',
    });
  };

  const filteredReports = reports.filter((rep) => {
    const matchesType = selectedType === 'ALL' || rep.reportType === selectedType;
    const matchesSearch =
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.datasetName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const pieChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
    },
    legend: {
      bottom: '0%',
      textStyle: { color: '#DFB6B2', fontSize: 11 },
    },
    series: [
      {
        name: 'Report Types',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#190019',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 12, fontWeight: 'bold', color: '#FBE4D8' },
        },
        data: [
          { value: reports.filter((r) => r.reportType === 'QUALITY').length, name: 'Data Quality', itemStyle: { color: '#DFB6B2' } },
          { value: reports.filter((r) => r.reportType === 'MODEL_IMPACT').length, name: 'Model Impact', itemStyle: { color: '#854F6C' } },
          { value: reports.filter((r) => r.reportType === 'DRIFT_AUDIT').length, name: 'Drift Audit', itemStyle: { color: '#522B5B' } },
          { value: reports.filter((r) => r.reportType === 'EXECUTIVE_SUMMARY').length, name: 'Executive Summary', itemStyle: { color: '#FBE4D8' } },
        ],
      },
    ],
  };

  const qualityTrendOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Sep 15', 'Sep 18', 'Sep 22', 'Sep 24', 'Current'],
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#DFB6B2' },
    },
    yAxis: {
      type: 'value',
      min: 60,
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(82, 43, 91, 0.3)' } },
      axisLabel: { color: '#DFB6B2', formatter: '{value}%' },
    },
    series: [
      {
        name: 'Avg Quality Score',
        type: 'line',
        smooth: true,
        data: [82.0, 85.6, 92.1, 76.2, 88.4],
        itemStyle: { color: '#DFB6B2' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(223, 182, 178, 0.4)' },
              { offset: 1, color: 'rgba(223, 182, 178, 0.0)' },
            ],
          },
        },
      },
      {
        name: 'Reliability Index',
        type: 'line',
        smooth: true,
        data: [80.5, 83.5, 94.0, 71.5, 85.0],
        itemStyle: { color: '#FBE4D8' },
      },
    ],
  };

  const getTypeBadge = (type: ReportItem['reportType']) => {
    switch (type) {
      case 'QUALITY':
        return <span className="px-2 py-0.5 text-xs rounded bg-purple-900/60 text-[#DFB6B2] border border-[#522B5B]">Quality Audit</span>;
      case 'MODEL_IMPACT':
        return <span className="px-2 py-0.5 text-xs rounded bg-pink-900/60 text-[#FBE4D8] border border-[#854F6C]">Model Impact</span>;
      case 'DRIFT_AUDIT':
        return <span className="px-2 py-0.5 text-xs rounded bg-blue-900/60 text-blue-300 border border-blue-700">Drift Audit</span>;
      case 'EXECUTIVE_SUMMARY':
        return <span className="px-2 py-0.5 text-xs rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">Executive</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#FBE4D8]">Audit & Impact Reports</h1>
          <p className="text-[#DFB6B2] text-sm mt-1">
            Generate and export comprehensive data reliability, model degradation, and decision impact summaries
          </p>
        </div>
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#522B5B] hover:bg-[#854F6C] text-[#FBE4D8] rounded-lg transition-colors shadow-lg border border-[#854F6C]/40"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-xl p-5"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#DFB6B2] font-medium uppercase tracking-wider">Total Reports</p>
              <h3 className="text-2xl font-bold text-[#FBE4D8] mt-1">{reports.length}</h3>
              <p className="text-xs text-[#DFB6B2]/80 mt-1">Across 4 domain pipelines</p>
            </div>
            <div className="p-2.5 bg-[#522B5B]/50 rounded-lg text-[#FBE4D8]">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-xl p-5"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#DFB6B2] font-medium uppercase tracking-wider">Avg Quality Audited</p>
              <h3 className="text-2xl font-bold text-[#DFB6B2] mt-1">85.6%</h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1 inline" /> Above 80% SLA
              </p>
            </div>
            <div className="p-2.5 bg-[#522B5B]/50 rounded-lg text-[#DFB6B2]">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-xl p-5"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#DFB6B2] font-medium uppercase tracking-wider">Anomalies Documented</p>
              <h3 className="text-2xl font-bold text-[#FBE4D8] mt-1">110</h3>
              <p className="text-xs text-amber-300 mt-1">IsolationForest & IQR</p>
            </div>
            <div className="p-2.5 bg-[#522B5B]/50 rounded-lg text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-xl p-5"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#DFB6B2] font-medium uppercase tracking-wider">Decision ROI Protected</p>
              <h3 className="text-2xl font-bold text-emerald-300 mt-1">$125.0K</h3>
              <p className="text-xs text-emerald-400 mt-1">Losses prevented</p>
            </div>
            <div className="p-2.5 bg-[#522B5B]/50 rounded-lg text-emerald-300">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-xl p-5 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#FBE4D8]">Historical Audit Quality & Reliability Trend</h3>
            <span className="text-xs text-[#DFB6B2]">Last 30 Days</span>
          </div>
          <div className="h-64">
            <ReactECharts option={qualityTrendOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>

        <div className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#FBE4D8]">Reports by Dimension</h3>
            <span className="text-xs text-[#DFB6B2]">Distribution</span>
          </div>
          <div className="h-64">
            <ReactECharts option={pieChartOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-[#DFB6B2]" />
          {['ALL', 'QUALITY', 'MODEL_IMPACT', 'DRIFT_AUDIT', 'EXECUTIVE_SUMMARY'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                selectedType === type
                  ? 'bg-[#522B5B] text-[#FBE4D8] font-medium border border-[#854F6C]'
                  : 'bg-[#190019]/60 text-[#DFB6B2] hover:bg-[#522B5B]/30'
              }`}
            >
              {type === 'ALL'
                ? 'All Types'
                : type === 'QUALITY'
                ? 'Quality'
                : type === 'MODEL_IMPACT'
                ? 'Model Impact'
                : type === 'DRIFT_AUDIT'
                ? 'Drift Audit'
                : 'Executive'}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search reports or datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-[#190019]/60 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] placeholder-[#854F6C] focus:outline-none focus:border-[#DFB6B2]"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#2B124C]/40 backdrop-blur-md border border-[#522B5B] hover:border-[#854F6C] rounded-xl p-5 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getTypeBadge(report.reportType)}
                  <h3 className="text-base font-semibold text-[#FBE4D8]">{report.title}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#DFB6B2]">
                  <span className="flex items-center">
                    <Database className="w-3.5 h-3.5 mr-1 text-[#854F6C]" /> {report.datasetName}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-[#854F6C]" /> {report.generatedAt}
                  </span>
                  <span>
                    Quality: <strong className="text-[#FBE4D8]">{report.qualityScore}%</strong>
                  </span>
                  <span>
                    Reliability: <strong className="text-[#FBE4D8]">{report.reliabilityScore}%</strong>
                  </span>
                  <span>
                    Anomalies: <strong className="text-amber-300">{report.anomaliesFound}</strong>
                  </span>
                </div>

                <p className="text-xs text-[#DFB6B2]/90 line-clamp-2">{report.summary}</p>
              </div>

              <div className="flex items-center gap-2 self-end lg:self-center">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#522B5B]/50 hover:bg-[#522B5B] text-[#FBE4D8] rounded-lg text-xs transition-colors border border-[#854F6C]/40"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    try {
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute('href', dataStr);
                      downloadAnchor.setAttribute('download', `${report.id}_report.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();

                      addNotification({
                        title: 'Report Exported',
                        message: `${report.title} has been downloaded successfully.`,
                        type: 'success',
                      });
                    } catch (error) {
                      addNotification({
                        title: 'Export Failed',
                        message: 'Failed to export the report. Please try again.',
                        type: 'error',
                      });
                    }
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#190019]/60 hover:bg-[#522B5B]/40 text-[#DFB6B2] rounded-lg text-xs transition-colors border border-[#522B5B]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Generate Report Modal */}
      <AnimatePresence>
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#190019] border border-[#522B5B] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#522B5B]">
                <h3 className="text-xl font-bold text-[#FBE4D8]">Generate New Audit Report</h3>
                <button onClick={() => setIsGenerateModalOpen(false)} className="text-[#DFB6B2] hover:text-[#FBE4D8]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGenerateReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Report Title (Optional)</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Weekly Pipeline Quality Audit"
                    className="w-full px-3 py-2 bg-[#2B124C]/50 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Target Dataset</label>
                  <select
                    value={newDataset}
                    onChange={(e) => setNewDataset(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2B124C]/50 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                  >
                    <option value="retail_transactions_2026.csv">retail_transactions_2026.csv</option>
                    <option value="product_inventory_v2.csv">product_inventory_v2.csv</option>
                    <option value="supply_chain_metrics.csv">supply_chain_metrics.csv</option>
                    <option value="customer_segmentation.json">customer_segmentation.json</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#DFB6B2] mb-1">Report Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#2B124C]/50 border border-[#522B5B] rounded-lg text-sm text-[#FBE4D8] focus:outline-none focus:border-[#DFB6B2]"
                  >
                    <option value="QUALITY">Data Quality Assessment (6 Dimensions)</option>
                    <option value="MODEL_IMPACT">Model Impact & Degradation Analysis</option>
                    <option value="DRIFT_AUDIT">Drift & Reliability Audit</option>
                    <option value="EXECUTIVE_SUMMARY">Executive Governance & Decision ROI</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="px-4 py-2 bg-[#2B124C]/50 hover:bg-[#2B124C] text-[#DFB6B2] rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#522B5B] hover:bg-[#854F6C] text-[#FBE4D8] font-medium rounded-lg text-sm transition-colors"
                  >
                    Generate & Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#190019] border border-[#522B5B] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-start pb-3 border-b border-[#522B5B]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeBadge(selectedReport.reportType)}
                    <span className="text-xs text-[#DFB6B2]">{selectedReport.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#FBE4D8]">{selectedReport.title}</h2>
                  <p className="text-xs text-[#DFB6B2] mt-0.5">
                    Dataset: {selectedReport.datasetName} • Generated {selectedReport.generatedAt}
                  </p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="text-[#DFB6B2] hover:text-[#FBE4D8]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#2B124C]/60 p-3 rounded-lg border border-[#522B5B] text-center">
                  <p className="text-xs text-[#DFB6B2]">Quality Score</p>
                  <p className="text-xl font-bold text-[#DFB6B2] mt-1">{selectedReport.qualityScore}%</p>
                </div>
                <div className="bg-[#2B124C]/60 p-3 rounded-lg border border-[#522B5B] text-center">
                  <p className="text-xs text-[#DFB6B2]">Reliability Score</p>
                  <p className="text-xl font-bold text-[#FBE4D8] mt-1">{selectedReport.reliabilityScore}%</p>
                </div>
                <div className="bg-[#2B124C]/60 p-3 rounded-lg border border-[#522B5B] text-center">
                  <p className="text-xs text-[#DFB6B2]">Anomalies Found</p>
                  <p className="text-xl font-bold text-amber-300 mt-1">{selectedReport.anomaliesFound}</p>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold text-[#FBE4D8]">Executive Findings</h4>
                <p className="text-xs text-[#DFB6B2] bg-[#2B124C]/30 p-3 rounded-lg border border-[#522B5B]/50 leading-relaxed">
                  {selectedReport.summary}
                </p>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#FBE4D8]">Key Actionable Recommendations</h4>
                <div className="space-y-2">
                  {selectedReport.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start text-xs text-[#DFB6B2] bg-[#2B124C]/20 p-2.5 rounded-lg border border-[#522B5B]/40">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#522B5B] flex justify-between items-center">
                <button
                  onClick={() => {
                    setReports(reports.filter((r) => r.id !== selectedReport.id));
                    setSelectedReport(null);
                  }}
                  className="flex items-center text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  <span>Delete Report</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 bg-[#2B124C]/50 hover:bg-[#2B124C] text-[#DFB6B2] rounded-lg text-xs transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      try {
                        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedReport, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute('href', dataStr);
                        downloadAnchor.setAttribute('download', `${selectedReport.id}_report.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();

                        addNotification({
                          title: 'Report Downloaded',
                          message: `${selectedReport.title} has been exported successfully.`,
                          type: 'success',
                        });
                      } catch (error) {
                        addNotification({
                          title: 'Download Failed',
                          message: 'Failed to download the report. Please try again.',
                          type: 'error',
                        });
                      }
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-[#522B5B] hover:bg-[#854F6C] text-[#FBE4D8] rounded-lg text-xs transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Report</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
