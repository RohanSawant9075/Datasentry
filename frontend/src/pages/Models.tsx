import { motion } from 'framer-motion';
import { Brain, TrendingUp, Activity, Download, PlayCircle, AlertCircle } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { useState } from 'react';

export function Models() {
  const [selectedModel, setSelectedModel] = useState('retail_forecast_v1');

  const models = [
    {
      id: 'retail_forecast_v1',
      name: 'Retail Sales Forecasting v1',
      algorithm: 'LightGBM',
      status: 'PRODUCTION',
      accuracy: 94.2,
      precision: 92.8,
      recall: 93.5,
      f1_score: 93.1,
      training_date: '2024-03-10',
      last_prediction: '2024-03-15 14:25:00',
      predictions_count: 15420,
      features_count: 12,
      target: 'revenue',
    },
    {
      id: 'churn_prediction_v2',
      name: 'Customer Churn Prediction v2',
      algorithm: 'Random Forest',
      status: 'PRODUCTION',
      accuracy: 89.7,
      precision: 88.2,
      recall: 87.9,
      f1_score: 88.0,
      training_date: '2024-03-08',
      last_prediction: '2024-03-15 13:10:00',
      predictions_count: 8920,
      features_count: 18,
      target: 'churn',
    },
    {
      id: 'demand_forecast_v1',
      name: 'Product Demand Forecasting v1',
      algorithm: 'XGBoost',
      status: 'TESTING',
      accuracy: 91.5,
      precision: 90.1,
      recall: 89.8,
      f1_score: 89.9,
      training_date: '2024-03-14',
      last_prediction: '2024-03-15 10:30:00',
      predictions_count: 3210,
      features_count: 15,
      target: 'quantity',
    },
    {
      id: 'price_optimization_v1',
      name: 'Dynamic Price Optimization v1',
      algorithm: 'LightGBM',
      status: 'TRAINING',
      accuracy: null,
      precision: null,
      recall: null,
      f1_score: null,
      training_date: '2024-03-15',
      last_prediction: null,
      predictions_count: 0,
      features_count: 10,
      target: 'optimal_price',
    },
  ];

  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  const featureImportance = [
    { feature: 'quantity', importance: 0.28, rank: 1 },
    { feature: 'price', importance: 0.22, rank: 2 },
    { feature: 'discount', importance: 0.18, rank: 3 },
    { feature: 'category', importance: 0.12, rank: 4 },
    { feature: 'season', importance: 0.08, rank: 5 },
    { feature: 'day_of_week', importance: 0.06, rank: 6 },
    { feature: 'promotion', importance: 0.04, rank: 7 },
    { feature: 'stock_level', importance: 0.02, rank: 8 },
  ];

  const performanceOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
    },
    legend: {
      data: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
      textStyle: { color: '#DFB6B2' },
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C' },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C' },
      splitLine: { lineStyle: { color: '#2B124C', type: 'dashed' } },
    },
    series: [
      {
        name: 'Accuracy',
        type: 'line',
        data: [92.1, 92.8, 93.2, 93.7, 94.0, 94.2],
        lineStyle: { color: '#DFB6B2', width: 2 },
        itemStyle: { color: '#DFB6B2' },
      },
      {
        name: 'Precision',
        type: 'line',
        data: [90.5, 91.2, 91.8, 92.1, 92.5, 92.8],
        lineStyle: { color: '#854F6C', width: 2 },
        itemStyle: { color: '#854F6C' },
      },
      {
        name: 'Recall',
        type: 'line',
        data: [91.2, 91.8, 92.5, 93.0, 93.3, 93.5],
        lineStyle: { color: '#522B5B', width: 2 },
        itemStyle: { color: '#522B5B' },
      },
      {
        name: 'F1-Score',
        type: 'line',
        data: [90.8, 91.5, 92.1, 92.5, 92.9, 93.1],
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: { color: '#10b981' },
      },
    ],
  };

  const featureImportanceOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
      axisPointer: { type: 'shadow' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#2B124C', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: featureImportance.map(f => f.feature).reverse(),
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C' },
    },
    series: [
      {
        name: 'Importance',
        type: 'bar',
        data: featureImportance.map(f => (f.importance * 100).toFixed(1)).reverse(),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#522B5B' },
              { offset: 1, color: '#DFB6B2' }
            ],
          },
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: '#FBE4D8',
        },
      },
    ],
  };

  const predictionVolumeOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
      axisPointer: { type: 'shadow' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C' },
      splitLine: { lineStyle: { color: '#2B124C', type: 'dashed' } },
    },
    series: [
      {
        name: 'Predictions',
        type: 'bar',
        data: [2150, 2340, 2280, 2410, 2520, 1890, 1830],
        itemStyle: { color: '#DFB6B2' },
      },
    ],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRODUCTION':
        return 'badge-success';
      case 'TESTING':
        return 'badge-warning';
      case 'TRAINING':
        return 'badge-info';
      default:
        return 'badge-outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">ML Models</h1>
          <p className="text-text-secondary">
            Train and monitor machine learning models for predictions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn-primary flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            Train New Model
          </button>
        </div>
      </motion.div>

      {/* Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="input-field w-full"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} - {model.algorithm} ({model.status})
            </option>
          ))}
        </select>
      </motion.div>

      {/* Model Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-purple to-brand-pink flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{currentModel.name}</h2>
              <div className="flex items-center gap-3">
                <span className={`badge ${getStatusBadge(currentModel.status)}`}>
                  {currentModel.status}
                </span>
                <span className="badge badge-outline">{currentModel.algorithm}</span>
                <span className="text-sm text-text-muted">
                  Target: <span className="text-brand-pink">{currentModel.target}</span>
                </span>
              </div>
            </div>
          </div>
          {currentModel.status === 'PRODUCTION' && (
            <div className="flex items-center gap-2 text-status-healthy">
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium">Active</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-text-muted mb-1">Training Date</div>
            <div className="text-lg font-semibold">{currentModel.training_date}</div>
          </div>
          <div>
            <div className="text-sm text-text-muted mb-1">Features</div>
            <div className="text-lg font-semibold">{currentModel.features_count}</div>
          </div>
          <div>
            <div className="text-sm text-text-muted mb-1">Predictions</div>
            <div className="text-lg font-semibold">{currentModel.predictions_count.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-text-muted mb-1">Last Prediction</div>
            <div className="text-lg font-semibold">
              {currentModel.last_prediction ? currentModel.last_prediction.split(' ')[1] : 'N/A'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      {currentModel.accuracy && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-text-muted">Accuracy</div>
              <TrendingUp className="w-5 h-5 text-status-healthy" />
            </div>
            <div className="text-3xl font-bold mb-2">{currentModel.accuracy}%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${currentModel.accuracy}%` }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-text-muted">Precision</div>
              <TrendingUp className="w-5 h-5 text-brand-pink" />
            </div>
            <div className="text-3xl font-bold mb-2">{currentModel.precision}%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${currentModel.precision}%` }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-text-muted">Recall</div>
              <TrendingUp className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="text-3xl font-bold mb-2">{currentModel.recall}%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${currentModel.recall}%` }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-text-muted">F1-Score</div>
              <TrendingUp className="w-5 h-5 text-status-warning" />
            </div>
            <div className="text-3xl font-bold mb-2">{currentModel.f1_score}%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${currentModel.f1_score}%` }} />
            </div>
          </motion.div>
        </div>
      )}

      {currentModel.status === 'TRAINING' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-status-warning" />
            <div className="text-lg font-semibold">Model Training in Progress</div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Progress</span>
              <span className="font-medium">72%</span>
            </div>
            <div className="progress-bar h-3">
              <div className="progress-fill" style={{ width: '72%' }} />
            </div>
            <div className="text-sm text-text-muted">
              Estimated completion: ~15 minutes
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      {currentModel.accuracy && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Performance Over Time</h2>
            <ReactECharts option={performanceOptions} style={{ height: '300px' }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Feature Importance</h2>
            <ReactECharts option={featureImportanceOptions} style={{ height: '300px' }} />
          </motion.div>
        </div>
      )}

      {/* Prediction Volume */}
      {currentModel.predictions_count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Prediction Volume (Last 7 Days)</h2>
          <ReactECharts option={predictionVolumeOptions} style={{ height: '300px' }} />
        </motion.div>
      )}

      {/* All Models List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">All Models</h2>
        <div className="space-y-3">
          {models.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className={`p-4 rounded-button border transition-all cursor-pointer ${
                selectedModel === model.id
                  ? 'bg-background-card border-brand-purple'
                  : 'bg-background-primary border-background-card hover:border-brand-purple/50'
              }`}
              onClick={() => setSelectedModel(model.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Brain className="w-8 h-8 text-brand-pink" />
                  <div>
                    <div className="font-semibold mb-1">{model.name}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`badge ${getStatusBadge(model.status)}`}>
                        {model.status}
                      </span>
                      <span className="badge badge-outline">{model.algorithm}</span>
                      <span className="text-text-muted">
                        {model.features_count} features
                      </span>
                    </div>
                  </div>
                </div>
                {model.accuracy && (
                  <div className="text-right">
                    <div className="text-2xl font-bold">{model.accuracy}%</div>
                    <div className="text-sm text-text-muted">Accuracy</div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
