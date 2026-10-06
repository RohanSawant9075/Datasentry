FROM python:3.10-slim

WORKDIR /app

# Install system dependencies including libgomp1 needed for LightGBM/XGBoost
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies with high timeout and retries to handle large packages (lightgbm/xgboost/scipy/pandas)
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --default-timeout=1000 --retries 10 -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1001 mluser && \
    chown -R mluser:mluser /app

USER mluser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
