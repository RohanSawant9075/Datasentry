"""
Data Quality Analyzer
Analyzes data quality across 6 dimensions:
1. Completeness - Missing values
2. Validity - Type and range validation
3. Consistency - Cross-field validation
4. Uniqueness - Duplicate detection
5. Timeliness - Data freshness
6. Distribution - Statistical stability
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class QualityIssue:
    def __init__(self, column: str, issue_type: str, severity: str, count: int, description: str):
        self.column = column
        self.issue_type = issue_type
        self.severity = severity
        self.count = count
        self.description = description

    def to_dict(self):
        return {
            'column': self.column,
            'issue_type': self.issue_type,
            'severity': self.severity,
            'count': self.count,
            'description': self.description
        }


class QualityAnalyzer:
    def __init__(self, df: pd.DataFrame, schema: Optional[Dict[str, str]] = None):
        self.df = df
        self.schema = schema or {}
        self.row_count = len(df)
        self.issues = []

    def analyze(self) -> Dict[str, Any]:
        """Analyze data quality across all dimensions"""
        completeness = self._analyze_completeness()
        validity = self._analyze_validity()
        consistency = self._analyze_consistency()
        uniqueness = self._analyze_uniqueness()
        timeliness = self._analyze_timeliness()
        distribution = self._analyze_distribution()

        # Calculate overall score (weighted average)
        weights = {
            'completeness': 0.20,
            'validity': 0.20,
            'consistency': 0.15,
            'uniqueness': 0.15,
            'timeliness': 0.15,
            'distribution': 0.15
        }

        overall_score = (
            completeness['score'] * weights['completeness'] +
            validity['score'] * weights['validity'] +
            consistency['score'] * weights['consistency'] +
            uniqueness['score'] * weights['uniqueness'] +
            timeliness['score'] * weights['timeliness'] +
            distribution['score'] * weights['distribution']
        )

        return {
            'overall_score': round(overall_score, 2),
            'completeness': completeness,
            'validity': validity,
            'consistency': consistency,
            'uniqueness': uniqueness,
            'timeliness': timeliness,
            'distribution': distribution
        }

    def _analyze_completeness(self) -> Dict[str, Any]:
        """Analyze missing values"""
        issues = []
        total_cells = self.row_count * len(self.df.columns)
        missing_cells = self.df.isnull().sum().sum()
        completeness_ratio = 1 - (missing_cells / total_cells)

        for column in self.df.columns:
            missing_count = int(self.df[column].isnull().sum())
            if missing_count > 0:
                missing_pct = (missing_count / self.row_count) * 100

                if missing_pct > 50:
                    severity = 'HIGH'
                elif missing_pct > 10:
                    severity = 'MEDIUM'
                else:
                    severity = 'LOW'

                issues.append(QualityIssue(
                    column=column,
                    issue_type='missing_values',
                    severity=severity,
                    count=missing_count,
                    description=f'{missing_pct:.1f}% missing values detected'
                ))

        score = completeness_ratio * 100
        return {
            'score': round(score, 2),
            'issues': [issue.to_dict() for issue in issues]
        }

    def _analyze_validity(self) -> Dict[str, Any]:
        """Analyze type and range validity"""
        issues = []
        invalid_count = 0
        total_checks = 0

        for column in self.df.columns:
            series = self.df[column].dropna()
            if len(series) == 0:
                continue

            total_checks += len(series)

            # Type validation
            expected_type = self.schema.get(column, self._infer_type(series))

            if expected_type == 'numeric':
                # Check for negative values in columns that shouldn't have them
                if 'price' in column.lower() or 'quantity' in column.lower() or 'amount' in column.lower():
                    negative_count = int((series < 0).sum())
                    if negative_count > 0:
                        invalid_count += negative_count
                        issues.append(QualityIssue(
                            column=column,
                            issue_type='invalid_range',
                            severity='MEDIUM' if negative_count < 10 else 'HIGH',
                            count=negative_count,
                            description=f'{negative_count} negative values detected (invalid for {column})'
                        ))

                # Check for extreme outliers (beyond 5 std devs)
                if series.std() > 0:
                    mean = series.mean()
                    std = series.std()
                    extreme_outliers = int(((series < mean - 5*std) | (series > mean + 5*std)).sum())
                    if extreme_outliers > 0:
                        invalid_count += extreme_outliers
                        issues.append(QualityIssue(
                            column=column,
                            issue_type='extreme_values',
                            severity='LOW',
                            count=extreme_outliers,
                            description=f'{extreme_outliers} extreme outlier values detected'
                        ))

        validity_ratio = 1 - (invalid_count / max(total_checks, 1))
        score = validity_ratio * 100

        return {
            'score': round(score, 2),
            'issues': [issue.to_dict() for issue in issues]
        }

    def _analyze_consistency(self) -> Dict[str, Any]:
        """Analyze cross-field consistency"""
        issues = []
        inconsistent_count = 0
        total_checks = 0

        # Check for common consistency rules
        columns_lower = [col.lower() for col in self.df.columns]

        # Price-Revenue consistency
        if 'price' in columns_lower and 'quantity' in columns_lower and 'revenue' in columns_lower:
            price_col = self.df.columns[columns_lower.index('price')]
            qty_col = self.df.columns[columns_lower.index('quantity')]
            rev_col = self.df.columns[columns_lower.index('revenue')]

            calculated_revenue = self.df[price_col] * self.df[qty_col]
            inconsistent = ~np.isclose(calculated_revenue, self.df[rev_col], rtol=0.01, equal_nan=True)
            inconsistent_rows = int(inconsistent.sum())

            if inconsistent_rows > 0:
                total_checks += len(self.df)
                inconsistent_count += inconsistent_rows
                issues.append(QualityIssue(
                    column=f'{price_col},{qty_col},{rev_col}',
                    issue_type='calculation_mismatch',
                    severity='MEDIUM',
                    count=inconsistent_rows,
                    description=f'Price × Quantity ≠ Revenue in {inconsistent_rows} rows'
                ))

        # Date-related consistency
        date_columns = [col for col in self.df.columns if 'date' in col.lower()]
        if len(date_columns) >= 2:
            try:
                for i in range(len(date_columns) - 1):
                    col1 = pd.to_datetime(self.df[date_columns[i]], errors='coerce')
                    col2 = pd.to_datetime(self.df[date_columns[i+1]], errors='coerce')

                    # Check if dates are in logical order
                    if 'start' in date_columns[i].lower() and 'end' in date_columns[i+1].lower():
                        invalid_order = (col1 > col2).sum()
                        if invalid_order > 0:
                            total_checks += len(self.df)
                            inconsistent_count += invalid_order
                            issues.append(QualityIssue(
                                column=f'{date_columns[i]},{date_columns[i+1]}',
                                issue_type='date_order_inconsistency',
                                severity='MEDIUM',
                                count=int(invalid_order),
                                description=f'Start date after end date in {invalid_order} rows'
                            ))
            except:
                pass

        if total_checks == 0:
            score = 100.0  # No consistency checks applicable
        else:
            consistency_ratio = 1 - (inconsistent_count / total_checks)
            score = consistency_ratio * 100

        return {
            'score': round(score, 2),
            'issues': [issue.to_dict() for issue in issues]
        }

    def _analyze_uniqueness(self) -> Dict[str, Any]:
        """Analyze duplicate records"""
        issues = []

        # Check for completely duplicate rows
        duplicate_rows = self.df.duplicated().sum()
        if duplicate_rows > 0:
            issues.append(QualityIssue(
                column='_all_columns',
                issue_type='duplicate_rows',
                severity='MEDIUM',
                count=int(duplicate_rows),
                description=f'{duplicate_rows} completely duplicate rows found'
            ))

        # Check ID columns for duplicates
        id_columns = [col for col in self.df.columns if 'id' in col.lower()]
        for col in id_columns:
            dup_count = self.df[col].duplicated().sum()
            if dup_count > 0:
                issues.append(QualityIssue(
                    column=col,
                    issue_type='duplicate_ids',
                    severity='HIGH',
                    count=int(dup_count),
                    description=f'{dup_count} duplicate IDs in {col} column'
                ))

        # Calculate score
        total_potential_duplicates = self.row_count + sum(len(self.df[col]) for col in id_columns)
        actual_duplicates = duplicate_rows + sum(self.df[col].duplicated().sum() for col in id_columns)

        uniqueness_ratio = 1 - (actual_duplicates / max(total_potential_duplicates, 1))
        score = uniqueness_ratio * 100

        return {
            'score': round(score, 2),
            'issues': [issue.to_dict() for issue in issues]
        }

    def _analyze_timeliness(self) -> Dict[str, Any]:
        """Analyze data freshness"""
        issues = []
        date_columns = [col for col in self.df.columns if 'date' in col.lower() or 'time' in col.lower()]

        if not date_columns:
            return {'score': 100.0, 'issues': []}  # No date columns to check

        stale_threshold_days = 30
        current_date = datetime.now()
        stale_count = 0
        total_date_values = 0

        for col in date_columns:
            try:
                dates = pd.to_datetime(self.df[col], errors='coerce').dropna()
                total_date_values += len(dates)

                # Check for stale data (older than threshold)
                stale = dates < (current_date - timedelta(days=stale_threshold_days))
                stale_rows = stale.sum()

                if stale_rows > 0:
                    stale_count += stale_rows
                    issues.append(QualityIssue(
                        column=col,
                        issue_type='stale_data',
                        severity='LOW',
                        count=int(stale_rows),
                        description=f'{stale_rows} records older than {stale_threshold_days} days'
                    ))

                # Check for future dates
                future = dates > current_date
                future_count = future.sum()
                if future_count > 0:
                    issues.append(QualityIssue(
                        column=col,
                        issue_type='future_dates',
                        severity='MEDIUM',
                        count=int(future_count),
                        description=f'{future_count} future dates detected'
                    ))
            except Exception as e:
                logger.error(f"Failed to analyze timeliness for column {col}: {e}")

        if total_date_values == 0:
            score = 100.0
        else:
            timeliness_ratio = 1 - (stale_count / total_date_values)
            score = timeliness_ratio * 100

        return {
            'score': round(score, 2),
            'issues': [issue.to_dict() for issue in issues]
        }

    def _analyze_distribution(self) -> Dict[str, Any]:
        """Analyze statistical distribution stability"""
        issues = []

        numeric_columns = self.df.select_dtypes(include=[np.number]).columns

        for col in numeric_columns:
            series = self.df[col].dropna()
            if len(series) < 30:  # Need sufficient data
                continue

            # Check for high skewness
            skewness = series.skew()
            if abs(skewness) > 2:
                issues.append(QualityIssue(
                    column=col,
                    issue_type='high_skewness',
                    severity='LOW',
                    count=1,
                    description=f'High skewness detected: {skewness:.2f} (distribution is heavily skewed)'
                ))

            # Check for multimodality using std/mean ratio
            if series.mean() != 0:
                cv = series.std() / abs(series.mean())
                if cv > 1.5:
                    issues.append(QualityIssue(
                        column=col,
                        issue_type='high_variability',
                        severity='MEDIUM',
                        count=1,
                        description=f'High coefficient of variation: {cv:.2f} (unstable distribution)'
                    ))

        # Score based on number of distribution issues
        max_expected_issues = len(numeric_columns) * 2  # 2 checks per column
        if max_expected_issues == 0:
            score = 100.0
        else:
            score = max(0, 100 - (len(issues) / max_expected_issues) * 100)

        return {
            'score': round(score, 2),
            'issues': [issue.to_dict() for issue in issues]
        }

    def _infer_type(self, series: pd.Series) -> str:
        """Infer data type from series"""
        if pd.api.types.is_numeric_dtype(series):
            return 'numeric'
        elif pd.api.types.is_datetime64_any_dtype(series):
            return 'datetime'
        elif pd.api.types.is_bool_dtype(series):
            return 'boolean'
        else:
            unique_ratio = series.nunique() / len(series)
            return 'categorical' if unique_ratio < 0.05 else 'text'
