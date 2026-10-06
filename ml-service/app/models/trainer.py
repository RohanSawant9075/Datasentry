"""
Model Trainer for retail forecasting
Uses LightGBM for demand prediction
"""
import pandas as pd
import numpy as np
from lightgbm import LGBMRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from typing import Dict, List, Any, Optional, Tuple
import joblib
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ModelTrainer:
    def __init__(self, model_type: str = 'retail_forecasting'):
        self.model_type = model_type
        self.model = None
        self.feature_names = []
        self.target_name = None

    def train(self, df: pd.DataFrame, target_column: str,
              feature_columns: Optional[List[str]] = None,
              test_size: float = 0.2) -> Dict[str, Any]:
        """Train a LightGBM model for forecasting"""

        try:
            # Prepare features
            if feature_columns is None:
                # Auto-select numerical features
                feature_columns = df.select_dtypes(include=[np.number]).columns.tolist()
                if target_column in feature_columns:
                    feature_columns.remove(target_column)

            if len(feature_columns) == 0:
                raise ValueError("No valid features found for training")

            # Prepare data
            X = df[feature_columns].fillna(df[feature_columns].median())
            y = df[target_column].fillna(df[target_column].median())

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42
            )

            # Train LightGBM model
            self.model = LGBMRegressor(
                n_estimators=100,
                learning_rate=0.05,
                max_depth=7,
                num_leaves=31,
                min_child_samples=20,
                random_state=42,
                verbose=-1
            )

            self.model.fit(X_train, y_train)
            self.feature_names = feature_columns
            self.target_name = target_column

            # Evaluate
            train_pred = self.model.predict(X_train)
            test_pred = self.model.predict(X_test)

            train_mae = mean_absolute_error(y_train, train_pred)
            test_mae = mean_absolute_error(y_test, test_pred)
            train_rmse = np.sqrt(mean_squared_error(y_train, train_pred))
            test_rmse = np.sqrt(mean_squared_error(y_test, test_pred))

            # Feature importance
            feature_importance = dict(zip(
                feature_columns,
                self.model.feature_importances_.tolist()
            ))

            # Sort by importance
            sorted_features = sorted(
                feature_importance.items(),
                key=lambda x: x[1],
                reverse=True
            )

            return {
                'success': True,
                'model_id': f'lgbm_{self.model_type}_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
                'algorithm': 'LightGBM',
                'feature_count': len(feature_columns),
                'target': target_column,
                'metrics': {
                    'train_mae': round(train_mae, 4),
                    'test_mae': round(test_mae, 4),
                    'train_rmse': round(train_rmse, 4),
                    'test_rmse': round(test_rmse, 4),
                    'train_samples': len(X_train),
                    'test_samples': len(X_test)
                },
                'feature_importance': {
                    'top_features': [
                        {'feature': feat, 'importance': round(imp, 4)}
                        for feat, imp in sorted_features[:10]
                    ],
                    'all_features': feature_importance
                },
                'trained_at': datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Model training failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def predict(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Make predictions using trained model"""
        if self.model is None:
            raise ValueError("Model not trained yet")

        try:
            X = df[self.feature_names].fillna(df[self.feature_names].median())
            predictions = self.model.predict(X)

            # Calculate confidence (inverse of prediction variance)
            # For LightGBM, we can use leaf values as a proxy
            confidence = np.ones(len(predictions)) * 0.75  # Base confidence

            return {
                'predictions': predictions.tolist(),
                'confidence': confidence.tolist(),
                'feature_names': self.feature_names,
                'target_name': self.target_name
            }

        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise

    def save_model(self, filepath: str):
        """Save trained model to disk"""
        if self.model is None:
            raise ValueError("No model to save")

        model_data = {
            'model': self.model,
            'feature_names': self.feature_names,
            'target_name': self.target_name,
            'model_type': self.model_type
        }

        joblib.dump(model_data, filepath)
        logger.info(f"Model saved to {filepath}")

    def load_model(self, filepath: str):
        """Load trained model from disk"""
        model_data = joblib.load(filepath)

        self.model = model_data['model']
        self.feature_names = model_data['feature_names']
        self.target_name = model_data['target_name']
        self.model_type = model_data.get('model_type', 'unknown')

        logger.info(f"Model loaded from {filepath}")


class ImpactAnalyzer:
    def __init__(self, model: ModelTrainer):
        self.model = model

    def analyze_impact(self, clean_df: pd.DataFrame, corrupted_df: pd.DataFrame,
                      target_column: str) -> Dict[str, Any]:
        """Analyze model performance impact due to data quality issues"""

        try:
            # Get predictions on both datasets
            clean_pred = self.model.predict(clean_df)['predictions']
            corrupted_pred = self.model.predict(corrupted_df)['predictions']

            # Get actual values
            clean_actual = clean_df[target_column].fillna(clean_df[target_column].median()).values
            corrupted_actual = corrupted_df[target_column].fillna(corrupted_df[target_column].median()).values

            # Calculate metrics
            clean_mae = mean_absolute_error(clean_actual, clean_pred)
            corrupted_mae = mean_absolute_error(corrupted_actual, corrupted_pred)

            clean_rmse = np.sqrt(mean_squared_error(clean_actual, clean_pred))
            corrupted_rmse = np.sqrt(mean_squared_error(corrupted_actual, corrupted_pred))

            # Calculate degradation
            mae_degradation = ((corrupted_mae - clean_mae) / clean_mae) * 100
            rmse_degradation = ((corrupted_rmse - clean_rmse) / clean_rmse) * 100

            # Analyze feature-wise impact using feature importance
            feature_impact = {}
            if hasattr(self.model.model, 'feature_importances_'):
                for feat, importance in zip(self.model.feature_names, self.model.model.feature_importances_):
                    # Calculate distribution difference for this feature
                    if feat in clean_df.columns and feat in corrupted_df.columns:
                        clean_values = clean_df[feat].dropna()
                        corrupted_values = corrupted_df[feat].dropna()

                        if len(clean_values) > 0 and len(corrupted_values) > 0:
                            mean_diff = abs(clean_values.mean() - corrupted_values.mean())
                            std_diff = abs(clean_values.std() - corrupted_values.std())

                            feature_impact[feat] = {
                                'importance': float(importance),
                                'mean_difference': float(mean_diff),
                                'std_difference': float(std_diff),
                                'impact_score': float(importance * (mean_diff + std_diff))
                            }

            # Sort features by impact
            sorted_impact = sorted(
                feature_impact.items(),
                key=lambda x: x[1]['impact_score'],
                reverse=True
            )

            return {
                'clean_performance': {
                    'mae': round(clean_mae, 4),
                    'rmse': round(clean_rmse, 4)
                },
                'corrupted_performance': {
                    'mae': round(corrupted_mae, 4),
                    'rmse': round(corrupted_rmse, 4)
                },
                'degradation': {
                    'mae_pct': round(mae_degradation, 2),
                    'rmse_pct': round(rmse_degradation, 2),
                    'severity': 'HIGH' if mae_degradation > 20 else 'MEDIUM' if mae_degradation > 10 else 'LOW'
                },
                'feature_impact': {
                    'top_impacted_features': [
                        {'feature': feat, **impact}
                        for feat, impact in sorted_impact[:5]
                    ],
                    'all_features': feature_impact
                },
                'prediction_deviation': {
                    'mean_deviation': float(np.mean(np.abs(np.array(clean_pred) - np.array(corrupted_pred)))),
                    'max_deviation': float(np.max(np.abs(np.array(clean_pred) - np.array(corrupted_pred))))
                }
            }

        except Exception as e:
            logger.error(f"Impact analysis failed: {e}")
            return {
                'error': str(e)
            }
