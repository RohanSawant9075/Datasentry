"""
S3 Client for uploading/downloading datasets and models
"""
import boto3
from botocore.exceptions import ClientError
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class S3Client:
    def __init__(self):
        try:
            self.s3_client = boto3.client(
                's3',
                region_name=os.getenv('AWS_REGION', 'us-east-1'),
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
            )
        except Exception as e:
            logger.warning(f"S3 client initialization failed ({e}). Falling back to local file storage.")
            self.s3_client = None
        self.datasets_bucket = os.getenv('S3_BUCKET_DATASETS', 'datasentry-datasets-dev')
        self.models_bucket = os.getenv('S3_BUCKET_MODELS', 'datasentry-models-dev')
        self.local_dir = os.getenv('LOCAL_STORAGE_DIR', os.path.join(os.getcwd(), 'storage'))
        os.makedirs(self.local_dir, exist_ok=True)

    def _get_local_fallback(self, s3_key: str) -> Optional[bytes]:
        """Try to read from local paths as fallback"""
        base_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        possible_paths = [
            s3_key,
            os.path.join(self.local_dir, s3_key),
            os.path.join(os.getcwd(), 'uploads', s3_key),
            os.path.join(os.getcwd(), 'storage', s3_key),
            os.path.join(os.getcwd(), s3_key),
            os.path.join('..', 'uploads', s3_key),
            os.path.join('..', 'storage', s3_key),
            os.path.join('..', 'backend', 'uploads', s3_key),
            os.path.join(base_root, 'backend', 'uploads', s3_key),
            os.path.join(base_root, 'uploads', s3_key),
            os.path.join(base_root, 'storage', s3_key),
        ]
        for path in possible_paths:
            if os.path.exists(path) and os.path.isfile(path):
                try:
                    with open(path, 'rb') as f:
                        return f.read()
                except Exception as e:
                    logger.error(f"Error reading local file {path}: {e}")
        return None

    def upload_file(self, file_path: str, s3_key: str, bucket: Optional[str] = None) -> bool:
        """Upload a file to S3 or save locally"""
        if self.s3_client:
            try:
                bucket = bucket or self.datasets_bucket
                self.s3_client.upload_file(file_path, bucket, s3_key)
                logger.info(f"Successfully uploaded {file_path} to s3://{bucket}/{s3_key}")
                return True
            except (ClientError, Exception) as e:
                logger.warning(f"Failed to upload to S3 ({e}), saving locally")

        # Local fallback
        try:
            target_path = os.path.join(self.local_dir, s3_key)
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
            import shutil
            shutil.copy2(file_path, target_path)
            return True
        except Exception as e:
            logger.error(f"Failed local fallback save: {e}")
            return False

    def download_file(self, s3_key: str, local_path: str, bucket: Optional[str] = None) -> bool:
        """Download a file from S3 or copy from local fallback"""
        if self.s3_client:
            try:
                bucket = bucket or self.datasets_bucket
                self.s3_client.download_file(bucket, s3_key, local_path)
                logger.info(f"Successfully downloaded s3://{bucket}/{s3_key} to {local_path}")
                return True
            except (ClientError, Exception) as e:
                logger.warning(f"Failed to download from S3 ({e}), checking local fallback")

        content = self._get_local_fallback(s3_key)
        if content is not None:
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            with open(local_path, 'wb') as f:
                f.write(content)
            return True
        return False

    def get_file_content(self, s3_key: str, bucket: Optional[str] = None) -> Optional[bytes]:
        """Get file content from S3 or local fallback"""
        if self.s3_client:
            try:
                bucket = bucket or self.datasets_bucket
                response = self.s3_client.get_object(Bucket=bucket, Key=s3_key)
                return response['Body'].read()
            except (ClientError, Exception) as e:
                logger.warning(f"Failed to get file content from S3 ({e}), trying local fallback")

        return self._get_local_fallback(s3_key)

    def file_exists(self, s3_key: str, bucket: Optional[str] = None) -> bool:
        """Check if a file exists in S3 or locally"""
        if self.s3_client:
            try:
                bucket = bucket or self.datasets_bucket
                self.s3_client.head_object(Bucket=bucket, Key=s3_key)
                return True
            except (ClientError, Exception):
                pass
        return self._get_local_fallback(s3_key) is not None

    def delete_file(self, s3_key: str, bucket: Optional[str] = None) -> bool:
        """Delete a file from S3"""
        try:
            bucket = bucket or self.datasets_bucket
            self.s3_client.delete_object(Bucket=bucket, Key=s3_key)
            logger.info(f"Successfully deleted s3://{bucket}/{s3_key}")
            return True
        except ClientError as e:
            logger.error(f"Failed to delete from S3: {e}")
            return False

    def generate_presigned_url(self, s3_key: str, bucket: Optional[str] = None, expiration: int = 3600) -> Optional[str]:
        """Generate a presigned URL for downloading a file"""
        try:
            bucket = bucket or self.datasets_bucket
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': bucket, 'Key': s3_key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            return None


# Singleton instance
s3_client = S3Client()
