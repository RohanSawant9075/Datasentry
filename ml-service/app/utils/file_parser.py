"""
File Parser for CSV, JSON, Excel files
"""
import pandas as pd
import json
from io import BytesIO, StringIO
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class FileParser:
    @staticmethod
    def parse_csv(content: bytes, **kwargs) -> pd.DataFrame:
        """Parse CSV file content to DataFrame"""
        try:
            return pd.read_csv(BytesIO(content), **kwargs)
        except Exception as e:
            logger.error(f"Failed to parse CSV: {e}")
            raise ValueError(f"Invalid CSV file: {e}")

    @staticmethod
    def parse_json(content: bytes, **kwargs) -> pd.DataFrame:
        """Parse JSON file content to DataFrame"""
        try:
            data = json.loads(content.decode('utf-8'))
            return pd.DataFrame(data)
        except Exception as e:
            logger.error(f"Failed to parse JSON: {e}")
            raise ValueError(f"Invalid JSON file: {e}")

    @staticmethod
    def parse_excel(content: bytes, **kwargs) -> pd.DataFrame:
        """Parse Excel file content to DataFrame"""
        try:
            return pd.read_excel(BytesIO(content), **kwargs)
        except Exception as e:
            logger.error(f"Failed to parse Excel: {e}")
            raise ValueError(f"Invalid Excel file: {e}")

    @staticmethod
    def parse_file(content: bytes, file_extension: str, **kwargs) -> pd.DataFrame:
        """Parse file based on extension"""
        ext = file_extension.lower().lstrip('.')

        if ext == 'csv':
            return FileParser.parse_csv(content, **kwargs)
        elif ext == 'json':
            return FileParser.parse_json(content, **kwargs)
        elif ext in ['xlsx', 'xls']:
            return FileParser.parse_excel(content, **kwargs)
        else:
            raise ValueError(f"Unsupported file extension: {ext}")

    @staticmethod
    def infer_file_type(filename: str) -> str:
        """Infer file type from filename"""
        ext = filename.split('.')[-1].lower()
        if ext in ['csv', 'json', 'xlsx', 'xls']:
            return ext
        return 'unknown'

    @staticmethod
    def validate_dataframe(df: pd.DataFrame) -> Dict[str, Any]:
        """Validate DataFrame and return basic info"""
        if df is None or df.empty:
            raise ValueError("DataFrame is empty")

        return {
            'valid': True,
            'row_count': len(df),
            'column_count': len(df.columns),
            'columns': df.columns.tolist(),
            'memory_usage_mb': df.memory_usage(deep=True).sum() / (1024 * 1024)
        }


# Singleton instance
file_parser = FileParser()
