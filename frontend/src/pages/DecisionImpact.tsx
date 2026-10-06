import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, TrendingUp, AlertCircle, Info } from 'lucide-react';
import ReactECharts from 'echarts-for-react';

export function DecisionImpact() {
  const decisionMetrics = {
    revenue_impact: -125000,
    revenue_impact_percent: -8.5,
    false_positives: 145,
    false_negatives: 87,
    opportunity_cost: 95000,
    confidence_loss: 23.4,
  };

  const scenarios = [
    {
      name: 'Perfect Data',
      revenue: 1500000,
      accuracy: 95.0,
      false_positives: 20,
      false_negatives: 15,
      confidence: 98.5,
    },
    {
      name: 'Current Data',
      revenue: 1375000,
      accuracy: 86.5,
      false_positives: 145,
      false_negatives: 87,
      confidence: 75.1,
    },
    {
      name: 'Degraded Data',
      revenue: 1125000,
      accuracy: 72.1,
      false_positives: 285,
      false_negatives: 198,
      confidence: 52.3,
    },
  ];

  const decisions = [
    {
      id: 1,
      type: 'Inventory Restocking',
      data_quality: 78.5,
      prediction_confidence: 82.3,
      decision: 'Restock 5,000 units',
      actual_outcome: 'Overstock - 30% unsold',
      financial_impact: -45000,
      root_cause: 'Distribution drift in demand forecasting',
    },
    {
      id: 2,
      type: 'Pricing Strategy',
      data_quality: 85.2,
      prediction_confidence: 88.7,
      decision: 'Increase price by 15%',
      actual_outcome: 'Sales drop 22%',
      financial_impact: -32000,
      root_cause: 'Missing competitive pricing data',
    },
    {
      id: 3,
      type: 'Marketing Campaign',
      data_quality: 82.1,
      prediction_confidence: 79.5,
      decision: 'Target segment A ($50k spend)',
      actual_outcome: 'Low conversion (2.1%)',
      financial_impact: -28000,
      root_cause: 'Anomalies in customer behavior data',
    },
    {
      id: 4,
      type: 'Supply Chain',
      data_quality: 91.5,
      prediction_confidence: 93.2,
      decision: 'Optimize route B',
      actual_outcome: 'Cost reduced 12%',
      financial_impact: 18000,
      root_cause: 'High quality logistics data',
    },
  ];

  const revenueImpactOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
      formatter: (params: any) => {
        const value = params[0].value;
        return `${params[0].name}<br/>Revenue: $${(value / 1000).toFixed(0)}K`;
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: scenarios.map(s => s.name),
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: {
        color: '#854F6C',
        formatter: (value: number) => `$${(value / 1000).toFixed(0)}K`,
      },
      splitLine: { lineStyle: { color: '#2B124C', type: 'dashed' } },
    },
    series: [
      {
        name: 'Revenue',
        type: 'bar',
        data: scenarios.map(s => s.revenue),
        itemStyle: {
          color: (params: any) => {
            const colors = ['#10b981', '#f59e0b', '#ef4444'];
            return colors[params.dataIndex];
          },
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => `$${(params.value / 1000).toFixed(0)}K`,
          color: '#FBE4D8',
        },
      },
    ],
  };

  const confidenceComparisonOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
    },
    legend: {
      data: ['Accuracy', 'Confidence'],
      textStyle: { color: '#DFB6B2' },
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: scenarios.map(s => s.name),
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C' },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { lineStyle: { color: '#522B5B' } },
      axisLabel: { color: '#854F6C', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#2B124C', type: 'dashed' } },
    },
    series: [
      {
        name: 'Accuracy',
        type: 'line',
        data: scenarios.map(s => s.accuracy),
        lineStyle: { color: '#DFB6B2', width: 3 },
        itemStyle: { color: '#DFB6B2' },
      },
      {
        name: 'Confidence',
        type: 'line',
        data: scenarios.map(s => s.confidence),
        lineStyle: { color: '#854F6C', width: 3 },
        itemStyle: { color: '#854F6C' },
      },
    ],
  };

  const errorDistributionOptions = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2B124C',
      borderColor: '#522B5B',
      textStyle: { color: '#FBE4D8' },
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['False Positives', 'False Negatives'],
      textStyle: { color: '#DFB6B2' },
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: scenarios.map(s => s.name),
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
        name: 'False Positives',
        type: 'bar',
        stack: 'total',
        data: scenarios.map(s => s.false_positives),
        itemStyle: { color: '#f59e0b' },
      },
      {
        name: 'False Negatives',
        type: 'bar',
        stack: 'total',
        data: scenarios.map(s => s.false_negatives),
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
        <h1 className="text-3xl font-bold text-gradient mb-2">Decision Impact Analysis</h1>
        <p className="text-text-secondary">
          Quantify business impact of data quality on decision-making outcomes
        </p>
      </motion.div>

      {/* Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-muted">Revenue Impact</div>
            <DollarSign className="w-5 h-5 text-status-critical" />
          </div>
          <div className="text-3xl font-bold text-status-critical mb-2">
            ${(Math.abs(decisionMetrics.revenue_impact) / 1000).toFixed(0)}K
          </div>
          <div className="flex items-center gap-2 text-sm text-status-critical">
            <TrendingDown className="w-4 h-4" />
            <span>{decisionMetrics.revenue_impact_percent}% loss</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-muted">Decision Errors</div>
            <AlertCircle className="w-5 h-5 text-status-warning" />
          </div>
          <div className="text-3xl font-bold mb-2">
            {decisionMetrics.false_positives + decisionMetrics.false_negatives}
          </div>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span className="text-status-warning">{decisionMetrics.false_positives} FP</span>
            <span>•</span>
            <span className="text-status-critical">{decisionMetrics.false_negatives} FN</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-text-muted">Opportunity Cost</div>
            <TrendingDown className="w-5 h-5 text-status-warning" />
          </div>
          <div className="text-3xl font-bold text-status-warning mb-2">
            ${(decisionMetrics.opportunity_cost / 1000).toFixed(0)}K
          </div>
          <div className="text-sm text-text-secondary">
            Missed opportunities
          </div>
        </motion.div>
      </div>

      {/* Revenue Impact Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Revenue Impact by Data Quality</h2>
        <ReactECharts option={revenueImpactOptions} style={{ height: '300px' }} />
      </motion.div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Accuracy vs Confidence</h2>
          <ReactECharts option={confidenceComparisonOptions} style={{ height: '300px' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Decision Errors</h2>
          <ReactECharts option={errorDistributionOptions} style={{ height: '300px' }} />
        </motion.div>
      </div>

      {/* Decision Case Studies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Recent Decision Case Studies</h2>
        <div className="space-y-4">
          {decisions.map((decision, index) => (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + index * 0.05 }}
              className="p-4 bg-background-card rounded-button border border-background-card hover:border-brand-purple/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{decision.type}</h3>
                    <span className="badge badge-outline">{decision.decision}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-text-muted mb-1">Data Quality</div>
                      <div className="text-sm font-medium">{decision.data_quality}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted mb-1">Confidence</div>
                      <div className="text-sm font-medium">{decision.prediction_confidence}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted mb-1">Outcome</div>
                      <div className="text-sm font-medium">{decision.actual_outcome}</div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted mb-1">Financial Impact</div>
                      <div className={`text-sm font-bold ${decision.financial_impact > 0 ? 'text-status-healthy' : 'text-status-critical'}`}>
                        {decision.financial_impact > 0 ? '+' : ''}${(decision.financial_impact / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                </div>
                {decision.financial_impact > 0 ? (
                  <TrendingUp className="w-6 h-6 text-status-healthy flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-status-critical flex-shrink-0" />
                )}
              </div>
              <div className="flex items-start gap-2 p-3 bg-background-primary rounded-button">
                <Info className="w-4 h-4 text-brand-pink mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="text-text-muted">Root Cause: </span>
                  <span className="text-text-secondary">{decision.root_cause}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Cost Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Impact Cost Breakdown</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-button border border-red-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-status-critical/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-status-critical" />
              </div>
              <div>
                <div className="font-medium mb-1">Direct Revenue Loss</div>
                <div className="text-sm text-text-muted">Poor decision outcomes</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-status-critical">-$105K</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-button border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-status-warning/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-status-warning" />
              </div>
              <div>
                <div className="font-medium mb-1">Opportunity Cost</div>
                <div className="text-sm text-text-muted">Missed better decisions</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-status-warning">-$95K</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-button border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="font-medium mb-1">Operational Waste</div>
                <div className="text-sm text-text-muted">Inefficient resource allocation</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-400">-$25K</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-background-card rounded-button border-2 border-status-critical">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-status-critical flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg mb-1">Total Impact</div>
                <div className="text-sm text-text-muted">Combined financial loss</div>
              </div>
            </div>
            <div className="text-3xl font-bold text-status-critical">-$225K</div>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Strategic Recommendations</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-background-card rounded-button">
            <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">1</span>
            </div>
            <div>
              <div className="font-medium mb-1">Implement Real-time Drift Monitoring</div>
              <div className="text-sm text-text-muted">
                31% of revenue loss stems from distribution drift. Set up automated alerts when PSI &gt; 0.15.
                Estimated recovery: <span className="text-brand-pink font-medium">$70K/month</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-background-card rounded-button">
            <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">2</span>
            </div>
            <div>
              <div className="font-medium mb-1">Enhance Anomaly Detection Pipeline</div>
              <div className="text-sm text-text-muted">
                Pre-filter anomalies before model training. Reduce false positives by 60%.
                Estimated recovery: <span className="text-brand-pink font-medium">$45K/month</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-background-card rounded-button">
            <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">3</span>
            </div>
            <div>
              <div className="font-medium mb-1">Decision Confidence Thresholds</div>
              <div className="text-sm text-text-muted">
                Only act on predictions with &gt;85% confidence. Route low-confidence decisions to human review.
                Estimated recovery: <span className="text-brand-pink font-medium">$30K/month</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
