import { motion } from 'framer-motion';
import { Target, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

export function ModelImpact() {
  const impactScores = {
    overall_impact: 23.5,
    quality_impact: 18.2,
    anomaly_impact: 28.7,
    drift_impact: 31.4,
    reliability_drop: 12.8,
  };

  const scenarios = [
    {
      id: 1,
      name: 'Baseline (Clean Data)',
      quality_score: 95.0,
      model_accuracy: 94.2,
      model_precision: 92.8,
      model_recall: 93.5,
      prediction_error: 5.8,
      color: '#10b981',
    },
    {
      id: 2,
      name: 'With Missing Values (10%)',
      quality_score: 85.5,
      model_accuracy: 89.3,
      model_precision: 87.2,
      model_recall: 88.1,
      prediction_error: 10.7,
      color: '#f59e0b',
    },
    {
      id: 3,
      name: 'With Anomalies (5%)',
      quality_score: 82.1,
      model_accuracy: 85.7,
      model_precision: 83.9,
      model_recall: 84.8,
      prediction_error: 14.3,
      color: '#ef4444',
    },
    {
      id: 4,
      name: 'With Drift (PSI > 0.25)',
      quality_score: 78.3,
      model_accuracy: 82.1,
      model_precision: 80.2,
      model_recall: 81.5,
      prediction_error: 17.9,
      color: '#dc2626',
    },
    {
      id: 5,
      name: 'Combined Issues',
      quality_score: 68.5,
      model_accuracy: 71.8,
      model_precision: 69.4,
      model_recall: 70.6,
      prediction_error: 28.2,
      color: '#991b1b',
    },
  ];

  const impactByDimension = [
    { dimension: 'Completeness', baseline: 92.0, impacted: 78.5, drop: 13.5, severity: 'HIGH' },
    { dimension: 'Validity', baseline: 85.0, impacted: 68.2, drop: 16.8, severity: 'CRITICAL' },
    { dimension: 'Consistency', baseline: 70.0, impacted: 58.3, drop: 11.7, severity: 'HIGH' },
    { dimension: 'Distribution', baseline: 62.0, impacted: 41.2, drop: 20.8, severity: 'CRITICAL' },
  ];

  const scenarioComparisonOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['Accuracy', 'Precision', 'Recall'],
      textStyle: { color: '#DFB6B2' },
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: scenarios.map(s => s.name),
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C', rotate: 20 },
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
        type: 'bar',
        data: scenarios.map(s => s.model_accuracy),
        itemStyle: { color: '#DFB6B2' },
      },
      {
        name: 'Precision',
        type: 'bar',
        data: scenarios.map(s => s.model_precision),
        itemStyle: { color: '#854F6C' },
      },
      {
        name: 'Recall',
        type: 'bar',
        data: scenarios.map(s => s.model_recall),
        itemStyle: { color: '#522B5B' },
      },
    ],
  };

  const errorImpactOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: scenarios.map(s => s.name),
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C', rotate: 20 },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#2B124C', type: 'dashed' } },
    },
    series: [
      {
        name: 'Prediction Error',
        type: 'line',
        data: scenarios.map(s => s.prediction_error),
        lineStyle: { color: '#ef4444', width: 3 },
        itemStyle: { color: '#ef4444' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0)' }
            ],
          },
        },
      },
    ],
  };

  const dimensionImpactOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['Baseline', 'Impacted', 'Drop'],
      textStyle: { color: '#DFB6B2' },
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C' },
      splitLine: { lineStyle: { color: '#2B124C', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: impactByDimension.map(d => d.dimension).reverse(),
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C' },
    },
    series: [
      {
        name: 'Baseline',
        type: 'bar',
        stack: 'total',
        data: impactByDimension.map(d => d.impacted).reverse(),
        itemStyle: { color: '#522B5B' },
      },
      {
        name: 'Drop',
        type: 'bar',
        stack: 'total',
        data: impactByDimension.map(d => d.drop).reverse(),
        itemStyle: { color: '#ef4444' },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gradient mb-2">Model Impact Analysis</h1>
        <p className="text-text-secondary">
          Quantify how data quality issues affect model performance
        </p>
      </motion.div>

      {/* Impact Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-muted">Overall Impact Score</div>
            <Target className="w-5 h-5 text-status-critical" />
          </div>
          <div className="text-3xl font-bold text-status-critical mb-2">
            -{impactScores.overall_impact}%
          </div>
          <div className="text-sm text-text-secondary">
            Accuracy degradation
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-muted">Max Drift Impact</div>
            <TrendingDown className="w-5 h-5 text-status-critical" />
          </div>
          <div className="text-3xl font-bold text-status-critical mb-2">
            -{impactScores.drift_impact}%
          </div>
          <div className="text-sm text-text-secondary">
            Worst case scenario
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-muted">Reliability Drop</div>
            <AlertTriangle className="w-5 h-5 text-status-warning" />
          </div>
          <div className="text-3xl font-bold text-status-warning mb-2">
            -{impactScores.reliability_drop}%
          </div>
          <div className="text-sm text-text-secondary">
            Overall data trust
          </div>
        </motion.div>
      </div>

      {/* Scenario Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Performance Across Scenarios</h2>
        <ReactECharts option={scenarioComparisonOptions} style={{ height: '400px' }} />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Prediction Error Growth</h2>
          <ReactECharts option={errorImpactOptions} style={{ height: '300px' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Impact by Quality Dimension</h2>
          <ReactECharts option={dimensionImpactOptions} style={{ height: '300px' }} />
        </motion.div>
      </div>

      {/* Detailed Scenario Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Detailed Scenario Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-background-card">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Scenario</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Quality Score</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Accuracy</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Precision</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Recall</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Prediction Error</th>
                <th className="text-center py-3 px-4 text-text-muted font-medium">Accuracy Drop</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario, index) => {
                const baselineAccuracy = scenarios[0].model_accuracy;
                const accuracyDrop = baselineAccuracy - scenario.model_accuracy;

                return (
                  <motion.tr
                    key={scenario.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.05 }}
                    className="border-b border-background-card hover:bg-background-card/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: scenario.color }}
                        />
                        <span className="font-medium">{scenario.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium">{scenario.quality_score}%</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium">{scenario.model_accuracy}%</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-text-secondary">{scenario.model_precision}%</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-text-secondary">{scenario.model_recall}%</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium text-status-critical">
                        {scenario.prediction_error}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {accuracyDrop > 0 ? (
                        <span className="badge badge-critical">
                          -{accuracyDrop.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="badge badge-success">Baseline</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-button border border-red-500/20">
            <AlertTriangle className="w-5 h-5 text-status-critical mt-0.5" />
            <div>
              <div className="font-medium text-status-critical mb-1">Critical Finding</div>
              <div className="text-sm text-text-muted">
                Distribution drift (PSI &gt; 0.25) causes a <strong>31.4% drop</strong> in model accuracy.
                This is the most impactful data quality issue detected.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-button border border-yellow-500/20">
            <Activity className="w-5 h-5 text-status-warning mt-0.5" />
            <div>
              <div className="font-medium text-status-warning mb-1">High Impact</div>
              <div className="text-sm text-text-muted">
                Anomalies (5% of data) reduce accuracy by <strong>8.5%</strong>. Implementing anomaly
                detection before model training can significantly improve performance.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-button border border-blue-500/20">
            <Target className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <div className="font-medium text-blue-400 mb-1">Recommendation</div>
              <div className="text-sm text-text-muted">
                Prioritize drift monitoring and anomaly detection. These two factors account for
                <strong> 60%</strong> of model performance degradation in corrupted scenarios.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
