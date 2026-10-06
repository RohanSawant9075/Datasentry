"""
Data Reliability Scorer
Calculates composite reliability score based on:
- Quality score
- Anomaly score
- Drift score
- Timeliness score
"""
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class ReliabilityScorer:
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        # Default weights
        self.weights = weights or {
            'quality': 0.35,
            'anomaly': 0.25,
            'drift': 0.25,
            'timeliness': 0.15
        }

    def calculate(self, quality_score: float, anomaly_count: int, drift_count: int,
                  timeliness_score: float, total_rows: int = 1000) -> Dict[str, Any]:
        """Calculate composite reliability score"""

        # Convert anomaly count to score (0-100)
        anomaly_ratio = min(anomaly_count / total_rows, 1.0)
        anomaly_score = (1 - anomaly_ratio) * 100

        # Convert drift count to score (0-100)
        # Assume max expected drift issues is 10% of columns
        max_expected_drifts = max(10, total_rows * 0.001)
        drift_ratio = min(drift_count / max_expected_drifts, 1.0)
        drift_score = (1 - drift_ratio) * 100

        # Calculate weighted composite score
        composite_score = (
            quality_score * self.weights['quality'] +
            anomaly_score * self.weights['anomaly'] +
            drift_score * self.weights['drift'] +
            timeliness_score * self.weights['timeliness']
        )

        # Classify reliability level
        if composite_score >= 90:
            reliability_level = 'EXCELLENT'
            risk_level = 'LOW'
        elif composite_score >= 75:
            reliability_level = 'GOOD'
            risk_level = 'LOW'
        elif composite_score >= 60:
            reliability_level = 'FAIR'
            risk_level = 'MEDIUM'
        elif composite_score >= 40:
            reliability_level = 'POOR'
            risk_level = 'HIGH'
        else:
            reliability_level = 'CRITICAL'
            risk_level = 'CRITICAL'

        return {
            'score': round(composite_score, 2),
            'reliability_level': reliability_level,
            'risk_level': risk_level,
            'quality_score': round(quality_score, 2),
            'anomaly_score': round(anomaly_score, 2),
            'drift_score': round(drift_score, 2),
            'timeliness_score': round(timeliness_score, 2),
            'components': {
                'quality': {
                    'score': round(quality_score, 2),
                    'weight': self.weights['quality'],
                    'contribution': round(quality_score * self.weights['quality'], 2)
                },
                'anomaly': {
                    'score': round(anomaly_score, 2),
                    'weight': self.weights['anomaly'],
                    'contribution': round(anomaly_score * self.weights['anomaly'], 2)
                },
                'drift': {
                    'score': round(drift_score, 2),
                    'weight': self.weights['drift'],
                    'contribution': round(drift_score * self.weights['drift'], 2)
                },
                'timeliness': {
                    'score': round(timeliness_score, 2),
                    'weight': self.weights['timeliness'],
                    'contribution': round(timeliness_score * self.weights['timeliness'], 2)
                }
            },
            'thresholds': {
                'excellent': 90,
                'good': 75,
                'fair': 60,
                'poor': 40
            }
        }

    def classify_risk(self, reliability_score: float, quality_issues: int,
                     critical_anomalies: int, high_severity_drifts: int) -> Dict[str, Any]:
        """Classify overall risk level with detailed reasoning"""

        risk_factors = []

        # Check reliability score
        if reliability_score < 40:
            risk_factors.append('Very low reliability score')
        elif reliability_score < 60:
            risk_factors.append('Low reliability score')

        # Check quality issues
        if quality_issues > 10:
            risk_factors.append(f'{quality_issues} quality issues detected')

        # Check critical anomalies
        if critical_anomalies > 0:
            risk_factors.append(f'{critical_anomalies} critical anomalies found')

        # Check high severity drifts
        if high_severity_drifts > 0:
            risk_factors.append(f'{high_severity_drifts} high-severity distribution drifts')

        # Determine overall risk
        if len(risk_factors) >= 3 or critical_anomalies > 5:
            risk_level = 'CRITICAL'
            recommendation = 'DO NOT USE - Data reliability is critically low. Human review required.'
        elif len(risk_factors) >= 2 or critical_anomalies > 0:
            risk_level = 'HIGH'
            recommendation = 'CAUTION - Significant data issues detected. Review before use.'
        elif len(risk_factors) >= 1:
            risk_level = 'MEDIUM'
            recommendation = 'MONITOR - Some data issues present. Proceed with awareness.'
        else:
            risk_level = 'LOW'
            recommendation = 'SAFE TO USE - Data reliability is acceptable.'

        return {
            'risk_level': risk_level,
            'risk_factors': risk_factors,
            'recommendation': recommendation,
            'confidence': 0.85 if len(risk_factors) <= 1 else 0.95
        }
