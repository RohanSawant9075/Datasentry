"""
Anomaly Detection Engine
Detects anomalies using multiple methods:
- IsolationForest: ML-based multivariate anomaly detection
- IQR: Statistical outlier detection
- Z-Score: Standard deviation-based detection
- Spike Detection: Sudden changes in time series
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, List, Any, Optional
import logging
import uuid

logger = logging.getLogger(__name__)


class Anomaly:
    def __init__(self, id: str, column_name: str, anomaly_type: str, severity: str,
                 affected_count: int, affected_rows: List[int], method: str,
                 threshold: Optional[float], explanation: str):
        self.id = id
        self.column_name = column_name
        self.anomaly_type = anomaly_type
        self.severity = severity
        self.affected_count = affected_count
        self.affected_rows = affected_rows
        self.method = method
        self.threshold = threshold
        self.explanation = explanation

    def to_dict(self):
        return {
            'id': self.id,
            'column_name': self.column_name,
            'anomaly_type': self.anomaly_type,
            'severity': self.severity,
            'affected_count': self.affected_count,
            'affected_rows': self.affected_rows,
            'method': self.method,
            'threshold': self.threshold,
            'explanation': self.explanation
        }


class AnomalyDetector:
    def __init__(self, df: pd.DataFrame, methods: List[str] = None):
        self.df = df
        self.methods = methods or ['IsolationForest', 'IQR', 'ZScore']
        self.anomalies = []

    def detect(self) -> Dict[str, Any]:
        """Detect anomalies using specified methods"""
        if 'IsolationForest' in self.methods:
            self._detect_isolation_forest()

        if 'IQR' in self.methods:
            self._detect_iqr_outliers()

        if 'ZScore' in self.methods:
            self._detect_zscore_outliers()

        if 'Spike' in self.methods:
            self._detect_spikes()

        # Categorical anomalies
        self._detect_categorical_anomalies()

        # Aggregate by severity
        by_severity = {
            'LOW': sum(1 for a in self.anomalies if a.severity == 'LOW'),
            'MEDIUM': sum(1 for a in self.anomalies if a.severity == 'MEDIUM'),
            'HIGH': sum(1 for a in self.anomalies if a.severity == 'HIGH'),
            'CRITICAL': sum(1 for a in self.anomalies if a.severity == 'CRITICAL'),
        }

        return {
            'total_anomalies': len(self.anomalies),
            'by_severity': by_severity,
            'anomalies': [a.to_dict() for a in self.anomalies]
        }

    def _detect_isolation_forest(self):
        """Detect anomalies using IsolationForest"""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns

        if len(numeric_cols) == 0:
            return

        # Prepare data (handle missing values)
        df_numeric = self.df[numeric_cols].fillna(self.df[numeric_cols].median())

        if len(df_numeric) < 10:
            return  # Need sufficient data

        try:
            # Train IsolationForest
            clf = IsolationForest(contamination=0.1, random_state=42, n_estimators=100)
            predictions = clf.fit_predict(df_numeric)
            scores = clf.score_samples(df_numeric)

            # Find anomalies (prediction == -1)
            anomaly_mask = predictions == -1
            anomaly_indices = np.where(anomaly_mask)[0].tolist()

            if len(anomaly_indices) > 0:
                # Determine severity based on anomaly score
                anomaly_scores = scores[anomaly_mask]
                mean_score = np.mean(anomaly_scores)

                if mean_score < -0.5:
                    severity = 'CRITICAL'
                elif mean_score < -0.3:
                    severity = 'HIGH'
                elif mean_score < -0.2:
                    severity = 'MEDIUM'
                else:
                    severity = 'LOW'

                self.anomalies.append(Anomaly(
                    id=str(uuid.uuid4()),
                    column_name='_multivariate',
                    anomaly_type='OUTLIER',
                    severity=severity,
                    affected_count=len(anomaly_indices),
                    affected_rows=anomaly_indices[:100],  # Limit to 100 for display
                    method='IsolationForest',
                    threshold=0.1,
                    explanation=f'{len(anomaly_indices)} multivariate anomalies detected across numeric columns'
                ))
        except Exception as e:
            logger.error(f"IsolationForest detection failed: {e}")

    def _detect_iqr_outliers(self):
        """Detect outliers using IQR method"""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns

        for col in numeric_cols:
            series = self.df[col].dropna()

            if len(series) < 10:
                continue

            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)
            iqr = q3 - q1

            if iqr == 0:
                continue

            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr

            outliers_mask = (self.df[col] < lower_bound) | (self.df[col] > upper_bound)
            outlier_indices = np.where(outliers_mask)[0].tolist()

            if len(outlier_indices) > 0:
                outlier_pct = (len(outlier_indices) / len(self.df)) * 100

                if outlier_pct > 10:
                    severity = 'HIGH'
                elif outlier_pct > 5:
                    severity = 'MEDIUM'
                else:
                    severity = 'LOW'

                self.anomalies.append(Anomaly(
                    id=str(uuid.uuid4()),
                    column_name=col,
                    anomaly_type='OUTLIER',
                    severity=severity,
                    affected_count=len(outlier_indices),
                    affected_rows=outlier_indices[:100],
                    method='IQR',
                    threshold=1.5,
                    explanation=f'{len(outlier_indices)} outliers detected in {col} (values outside [{lower_bound:.2f}, {upper_bound:.2f}])'
                ))

    def _detect_zscore_outliers(self):
        """Detect outliers using Z-Score method"""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns

        for col in numeric_cols:
            series = self.df[col].dropna()

            if len(series) < 10:
                continue

            mean = series.mean()
            std = series.std()

            if std == 0:
                continue

            z_scores = np.abs((self.df[col] - mean) / std)
            outliers_mask = z_scores > 3  # 3 standard deviations

            outlier_indices = np.where(outliers_mask)[0].tolist()

            if len(outlier_indices) > 0:
                outlier_pct = (len(outlier_indices) / len(self.df)) * 100

                if outlier_pct > 5:
                    severity = 'MEDIUM'
                else:
                    severity = 'LOW'

                self.anomalies.append(Anomaly(
                    id=str(uuid.uuid4()),
                    column_name=col,
                    anomaly_type='OUTLIER',
                    severity=severity,
                    affected_count=len(outlier_indices),
                    affected_rows=outlier_indices[:100],
                    method='Z-Score',
                    threshold=3.0,
                    explanation=f'{len(outlier_indices)} statistical outliers detected in {col} (|Z-score| > 3)'
                ))

    def _detect_spikes(self):
        """Detect sudden spikes in data"""
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns

        for col in numeric_cols:
            if len(self.df) < 5:
                continue

            series = self.df[col].fillna(method='ffill').fillna(method='bfill')

            # Calculate rolling mean and std
            window = min(10, len(series) // 3)
            if window < 2:
                continue

            rolling_mean = series.rolling(window=window, center=True).mean()
            rolling_std = series.rolling(window=window, center=True).std()

            # Detect spikes (values > mean + 3*std)
            spike_mask = np.abs(series - rolling_mean) > (3 * rolling_std)
            spike_indices = np.where(spike_mask)[0].tolist()

            # Filter consecutive spikes (actual spikes, not sustained high values)
            filtered_spikes = []
            for idx in spike_indices:
                if idx > 0 and idx < len(series) - 1:
                    if not (spike_mask.iloc[idx-1] and spike_mask.iloc[idx+1]):
                        filtered_spikes.append(idx)

            if len(filtered_spikes) > 0:
                self.anomalies.append(Anomaly(
                    id=str(uuid.uuid4()),
                    column_name=col,
                    anomaly_type='SPIKE',
                    severity='MEDIUM',
                    affected_count=len(filtered_spikes),
                    affected_rows=filtered_spikes[:100],
                    method='Spike Detection',
                    threshold=None,
                    explanation=f'{len(filtered_spikes)} sudden spikes detected in {col}'
                ))

    def _detect_categorical_anomalies(self):
        """Detect anomalies in categorical columns"""
        categorical_cols = self.df.select_dtypes(include=['object', 'category']).columns

        for col in categorical_cols:
            value_counts = self.df[col].value_counts()
            total = len(self.df[col].dropna())

            # Detect very rare categories (< 1% frequency)
            rare_threshold = 0.01
            rare_categories = value_counts[value_counts / total < rare_threshold]

            if len(rare_categories) > 0:
                rare_rows = self.df[self.df[col].isin(rare_categories.index)].index.tolist()

                self.anomalies.append(Anomaly(
                    id=str(uuid.uuid4()),
                    column_name=col,
                    anomaly_type='CATEGORICAL',
                    severity='LOW',
                    affected_count=len(rare_rows),
                    affected_rows=rare_rows[:100],
                    method='Frequency Analysis',
                    threshold=rare_threshold,
                    explanation=f'{len(rare_categories)} rare categories detected in {col} (< 1% frequency)'
                ))
