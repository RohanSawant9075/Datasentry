"""
Data Profiling Engine
Generates comprehensive statistical profiles for datasets
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class DataProfiler:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.row_count = len(df)
        self.column_count = len(df.columns)

    def profile_dataset(self) -> Dict[str, Any]:
        """Generate comprehensive dataset profile"""
        profiles = []

        for column in self.df.columns:
            profile = self.profile_column(column)
            if profile:
                profiles.append(profile)

        return {
            'row_count': self.row_count,
            'column_count': self.column_count,
            'profiles': profiles,
            'created_at': datetime.utcnow().isoformat()
        }

    def profile_column(self, column_name: str) -> Optional[Dict[str, Any]]:
        """Profile a single column"""
        try:
            series = self.df[column_name]
            data_type = self._infer_data_type(series)

            # Basic statistics
            missing_count = int(series.isnull().sum())
            missing_pct = float((missing_count / self.row_count) * 100)
            unique_count = int(series.nunique())
            duplicate_count = self.row_count - unique_count

            profile = {
                'column_name': column_name,
                'data_type': data_type,
                'missing_count': missing_count,
                'missing_pct': round(missing_pct, 2),
                'unique_count': unique_count,
                'duplicate_count': duplicate_count,
            }

            # Type-specific statistics
            if data_type == 'numeric':
                profile.update(self._profile_numeric(series))
            elif data_type == 'categorical':
                profile.update(self._profile_categorical(series))
            elif data_type == 'datetime':
                profile.update(self._profile_datetime(series))
            elif data_type == 'text':
                profile.update(self._profile_text(series))
            elif data_type == 'boolean':
                profile.update(self._profile_boolean(series))

            return profile

        except Exception as e:
            logger.error(f"Failed to profile column {column_name}: {e}")
            return None

    def _infer_data_type(self, series: pd.Series) -> str:
        """Infer semantic data type"""
        # Check pandas dtype first
        if pd.api.types.is_numeric_dtype(series):
            return 'numeric'
        elif pd.api.types.is_datetime64_any_dtype(series):
            return 'datetime'
        elif pd.api.types.is_bool_dtype(series):
            return 'boolean'
        else:
            # Try to infer from values
            non_null = series.dropna()
            if len(non_null) == 0:
                return 'text'

            # Check if it can be converted to datetime
            try:
                pd.to_datetime(non_null.head(100))
                return 'datetime'
            except:
                pass

            # Check cardinality for categorical
            unique_ratio = series.nunique() / len(series)
            if unique_ratio < 0.05:  # Less than 5% unique values
                return 'categorical'
            else:
                return 'text'

    def _profile_numeric(self, series: pd.Series) -> Dict[str, Any]:
        """Profile numerical column"""
        clean_series = series.dropna()

        if len(clean_series) == 0:
            return {
                'min_value': None,
                'max_value': None,
                'mean': None,
                'median': None,
                'std_dev': None,
                'statistics': {}
            }

        return {
            'min_value': str(float(clean_series.min())),
            'max_value': str(float(clean_series.max())),
            'mean': round(float(clean_series.mean()), 4),
            'median': round(float(clean_series.median()), 4),
            'std_dev': round(float(clean_series.std()), 4),
            'statistics': {
                'q1': round(float(clean_series.quantile(0.25)), 4),
                'q3': round(float(clean_series.quantile(0.75)), 4),
                'iqr': round(float(clean_series.quantile(0.75) - clean_series.quantile(0.25)), 4),
                'skewness': round(float(clean_series.skew()), 4),
                'kurtosis': round(float(clean_series.kurtosis()), 4),
                'zeros_count': int((clean_series == 0).sum()),
                'negative_count': int((clean_series < 0).sum()),
                'positive_count': int((clean_series > 0).sum()),
            }
        }

    def _profile_categorical(self, series: pd.Series) -> Dict[str, Any]:
        """Profile categorical column"""
        clean_series = series.dropna()
        value_counts = clean_series.value_counts().head(10)

        unique_count = series.nunique()
        total_count = len(series)

        if unique_count < 20:
            cardinality = 'low'
        elif unique_count < 100:
            cardinality = 'medium'
        else:
            cardinality = 'high'

        return {
            'min_value': None,
            'max_value': None,
            'mean': None,
            'median': None,
            'std_dev': None,
            'statistics': {
                'cardinality': cardinality,
                'unique_ratio': round(unique_count / total_count, 4),
                'top_values': [
                    {'value': str(val), 'count': int(count), 'percentage': round((count / total_count) * 100, 2)}
                    for val, count in value_counts.items()
                ],
                'mode': str(clean_series.mode()[0]) if len(clean_series.mode()) > 0 else None
            }
        }

    def _profile_datetime(self, series: pd.Series) -> Dict[str, Any]:
        """Profile datetime column"""
        try:
            clean_series = pd.to_datetime(series.dropna())

            if len(clean_series) == 0:
                return {
                    'min_value': None,
                    'max_value': None,
                    'statistics': {}
                }

            min_date = clean_series.min()
            max_date = clean_series.max()
            date_range = (max_date - min_date).days

            return {
                'min_value': str(min_date),
                'max_value': str(max_date),
                'mean': None,
                'median': None,
                'std_dev': None,
                'statistics': {
                    'date_range_days': int(date_range),
                    'earliest_date': str(min_date),
                    'latest_date': str(max_date),
                    'format': 'ISO8601'
                }
            }
        except Exception as e:
            logger.error(f"Failed to profile datetime column: {e}")
            return {'statistics': {}}

    def _profile_text(self, series: pd.Series) -> Dict[str, Any]:
        """Profile text column"""
        clean_series = series.dropna().astype(str)

        if len(clean_series) == 0:
            return {'statistics': {}}

        lengths = clean_series.str.len()

        return {
            'min_value': None,
            'max_value': None,
            'mean': None,
            'median': None,
            'std_dev': None,
            'statistics': {
                'avg_length': round(float(lengths.mean()), 2),
                'min_length': int(lengths.min()),
                'max_length': int(lengths.max()),
                'empty_strings': int((clean_series == '').sum()),
                'sample_values': clean_series.head(5).tolist()
            }
        }

    def _profile_boolean(self, series: pd.Series) -> Dict[str, Any]:
        """Profile boolean column"""
        clean_series = series.dropna()

        if len(clean_series) == 0:
            return {'statistics': {}}

        value_counts = clean_series.value_counts()

        return {
            'min_value': None,
            'max_value': None,
            'mean': None,
            'median': None,
            'std_dev': None,
            'statistics': {
                'true_count': int(value_counts.get(True, 0)),
                'false_count': int(value_counts.get(False, 0)),
                'true_percentage': round((value_counts.get(True, 0) / len(clean_series)) * 100, 2),
                'false_percentage': round((value_counts.get(False, 0) / len(clean_series)) * 100, 2)
            }
        }
