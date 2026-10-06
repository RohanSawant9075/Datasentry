# AWS Deployment Guide

## Architecture Overview

```
                        INTERNET
                           │
                           ▼
                  ┌────────────────┐
                  │  CloudFront    │ (CDN)
                  │  Distribution  │
                  └────────┬───────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │   S3 Bucket  │      │     ALB      │
        │  (Frontend)  │      │(Load Balancer)│
        └──────────────┘      └──────┬───────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
                  ┌──────────────┐      ┌──────────────┐
                  │  ECS Service │      │  ECS Service │
                  │   (Backend)  │      │ (ML Service) │
                  │              │      │              │
                  │  Fargate     │      │  Fargate     │
                  │  Tasks       │      │  Tasks       │
                  └──────┬───────┘      └──────┬───────┘
                         │                     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌──────────────────┐
                         │   RDS Instance   │
                         │   PostgreSQL     │
                         │                  │
                         │  Multi-AZ        │
                         └──────────────────┘
                                    
                         ┌──────────────────┐
                         │   S3 Bucket      │
                         │   (Datasets)     │
                         │                  │
                         │  Versioning ON   │
                         └──────────────────┘

                         ┌──────────────────┐
                         │  Secrets Manager │
                         │                  │
                         │  - DB Password   │
                         │  - JWT Secret    │
                         │  - API Keys      │
                         └──────────────────┘

                         ┌──────────────────┐
                         │   CloudWatch     │
                         │                  │
                         │  - Logs          │
                         │  - Metrics       │
                         │  - Alarms        │
                         └──────────────────┘
```

---

## Prerequisites

### Required Tools
- AWS CLI v2
- Docker & Docker Compose
- Node.js 18+
- Python 3.10+
- Git

### AWS Account Setup
1. AWS account with billing enabled
2. IAM user with appropriate permissions
3. AWS CLI configured with credentials

```bash
# Configure AWS CLI
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: us-east-1
# Default output format: json
```

---

## Infrastructure Setup

### 1. VPC and Networking

Create a VPC with public and private subnets.

```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=datasentry-vpc}]'

# Create Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=datasentry-igw}]'

# Attach to VPC
aws ec2 attach-internet-gateway \
  --internet-gateway-id <igw-id> \
  --vpc-id <vpc-id>

# Create Public Subnets (2 AZs for ALB)
aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=datasentry-public-1a}]'

aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=datasentry-public-1b}]'

# Create Private Subnets
aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.11.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=datasentry-private-1a}]'

aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.12.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=datasentry-private-1b}]'

# Create Route Tables and Routes
# (Configure public subnets to route through IGW)
```

---

### 2. Security Groups

```bash
# ALB Security Group (Allow HTTP/HTTPS from Internet)
aws ec2 create-security-group \
  --group-name datasentry-alb-sg \
  --description "Security group for DataSentry ALB" \
  --vpc-id <vpc-id>

aws ec2 authorize-security-group-ingress \
  --group-id <alb-sg-id> \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id <alb-sg-id> \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# ECS Security Group (Allow traffic from ALB)
aws ec2 create-security-group \
  --group-name datasentry-ecs-sg \
  --description "Security group for DataSentry ECS tasks" \
  --vpc-id <vpc-id>

aws ec2 authorize-security-group-ingress \
  --group-id <ecs-sg-id> \
  --protocol tcp \
  --port 3001 \
  --source-group <alb-sg-id>

aws ec2 authorize-security-group-ingress \
  --group-id <ecs-sg-id> \
  --protocol tcp \
  --port 8000 \
  --source-group <alb-sg-id>

# RDS Security Group (Allow traffic from ECS)
aws ec2 create-security-group \
  --group-name datasentry-rds-sg \
  --description "Security group for DataSentry RDS" \
  --vpc-id <vpc-id>

aws ec2 authorize-security-group-ingress \
  --group-id <rds-sg-id> \
  --protocol tcp \
  --port 5432 \
  --source-group <ecs-sg-id>
```

---

### 3. S3 Buckets

```bash
# Datasets Bucket
aws s3 mb s3://datasentry-datasets-prod --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket datasentry-datasets-prod \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket datasentry-datasets-prod \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Block public access
aws s3api put-public-access-block \
  --bucket datasentry-datasets-prod \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Frontend Static Site Bucket
aws s3 mb s3://datasentry-frontend-prod --region us-east-1

# Enable static website hosting
aws s3 website s3://datasentry-frontend-prod \
  --index-document index.html \
  --error-document index.html
```

---

### 4. RDS PostgreSQL

```bash
# Create DB Subnet Group
aws rds create-db-subnet-group \
  --db-subnet-group-name datasentry-db-subnet-group \
  --db-subnet-group-description "DataSentry DB Subnet Group" \
  --subnet-ids <private-subnet-1a-id> <private-subnet-1b-id>

# Create RDS Instance
aws rds create-db-instance \
  --db-instance-identifier datasentry-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.7 \
  --master-username datasentry_admin \
  --master-user-password <SECURE_PASSWORD> \
  --allocated-storage 20 \
  --storage-type gp3 \
  --vpc-security-group-ids <rds-sg-id> \
  --db-subnet-group-name datasentry-db-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --storage-encrypted \
  --no-publicly-accessible \
  --tags Key=Name,Value=datasentry-db
```

**Note:** Save the database endpoint for later use.

---

### 5. Secrets Manager

```bash
# Database credentials
aws secretsmanager create-secret \
  --name datasentry/database \
  --description "DataSentry database credentials" \
  --secret-string '{
    "host": "<rds-endpoint>",
    "port": "5432",
    "database": "datasentry",
    "username": "datasentry_admin",
    "password": "<SECURE_PASSWORD>"
  }'

# JWT Secret
aws secretsmanager create-secret \
  --name datasentry/jwt-secret \
  --description "DataSentry JWT signing secret" \
  --secret-string '{"secret": "<GENERATE_RANDOM_SECRET>"}'

# AWS Credentials (for ML service S3 access)
aws secretsmanager create-secret \
  --name datasentry/aws-credentials \
  --description "AWS credentials for S3 access" \
  --secret-string '{
    "access_key_id": "<ACCESS_KEY>",
    "secret_access_key": "<SECRET_KEY>"
  }'
```

---

### 6. ECR Repositories

```bash
# Create ECR repositories
aws ecr create-repository \
  --repository-name datasentry/backend \
  --region us-east-1

aws ecr create-repository \
  --repository-name datasentry/ml-service \
  --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

---

## Application Deployment

### 1. Build and Push Docker Images

#### Backend

```bash
cd backend

# Build
docker build -t datasentry/backend:latest .

# Tag for ECR
docker tag datasentry/backend:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/datasentry/backend:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/datasentry/backend:latest
```

#### ML Service

```bash
cd ml-service

# Build
docker build -t datasentry/ml-service:latest .

# Tag for ECR
docker tag datasentry/ml-service:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/datasentry/ml-service:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/datasentry/ml-service:latest
```

---

### 2. ECS Cluster

```bash
# Create ECS Cluster
aws ecs create-cluster \
  --cluster-name datasentry-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1 \
    capacityProvider=FARGATE_SPOT,weight=4
```

---

### 3. IAM Roles

#### ECS Task Execution Role

```bash
# Create role
aws iam create-role \
  --role-name datasentry-ecs-task-execution-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach policies
aws iam attach-role-policy \
  --role-name datasentry-ecs-task-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Custom policy for Secrets Manager
aws iam put-role-policy \
  --role-name datasentry-ecs-task-execution-role \
  --policy-name SecretsManagerAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "kms:Decrypt"
      ],
      "Resource": "*"
    }]
  }'
```

#### ECS Task Role (for application)

```bash
# Create role
aws iam create-role \
  --role-name datasentry-ecs-task-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# S3 access policy
aws iam put-role-policy \
  --role-name datasentry-ecs-task-role \
  --policy-name S3DatasetAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::datasentry-datasets-prod",
        "arn:aws:s3:::datasentry-datasets-prod/*"
      ]
    }]
  }'

# CloudWatch Logs
aws iam put-role-policy \
  --role-name datasentry-ecs-task-role \
  --policy-name CloudWatchLogsAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }]
  }'
```

---

### 4. Task Definitions

#### Backend Task Definition

Create `backend-task-definition.json`:

```json
{
  "family": "datasentry-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/datasentry-ecs-task-execution-role",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/datasentry-ecs-task-role",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/datasentry/backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3001"
        },
        {
          "name": "ML_SERVICE_URL",
          "value": "http://ml-service.local:8000"
        },
        {
          "name": "AWS_REGION",
          "value": "us-east-1"
        },
        {
          "name": "S3_BUCKET",
          "value": "datasentry-datasets-prod"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:datasentry/database"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:datasentry/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/datasentry-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "backend"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Register:
```bash
aws ecs register-task-definition \
  --cli-input-json file://backend-task-definition.json
```

#### ML Service Task Definition

Create `ml-service-task-definition.json`:

```json
{
  "family": "datasentry-ml-service",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/datasentry-ecs-task-execution-role",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/datasentry-ecs-task-role",
  "containerDefinitions": [
    {
      "name": "ml-service",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/datasentry/ml-service:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "AWS_REGION",
          "value": "us-east-1"
        },
        {
          "name": "S3_BUCKET",
          "value": "datasentry-datasets-prod"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/datasentry-ml-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ml-service"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Register:
```bash
aws ecs register-task-definition \
  --cli-input-json file://ml-service-task-definition.json
```

---

### 5. Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name datasentry-alb \
  --subnets <public-subnet-1a-id> <public-subnet-1b-id> \
  --security-groups <alb-sg-id> \
  --scheme internet-facing \
  --type application

# Create Target Groups
aws elbv2 create-target-group \
  --name datasentry-backend-tg \
  --protocol HTTP \
  --port 3001 \
  --vpc-id <vpc-id> \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30

aws elbv2 create-target-group \
  --name datasentry-ml-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id <vpc-id> \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30

# Create Listener
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=<backend-tg-arn>

# Add rule for ML service
aws elbv2 create-rule \
  --listener-arn <listener-arn> \
  --priority 1 \
  --conditions Field=path-pattern,Values='/ml/*' \
  --actions Type=forward,TargetGroupArn=<ml-tg-arn>
```

---

### 6. ECS Services

```bash
# Backend Service
aws ecs create-service \
  --cluster datasentry-cluster \
  --service-name datasentry-backend \
  --task-definition datasentry-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[<private-subnet-1a-id>,<private-subnet-1b-id>],
    securityGroups=[<ecs-sg-id>],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=<backend-tg-arn>,containerName=backend,containerPort=3001" \
  --health-check-grace-period-seconds 60

# ML Service
aws ecs create-service \
  --cluster datasentry-cluster \
  --service-name datasentry-ml-service \
  --task-definition datasentry-ml-service \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[<private-subnet-1a-id>,<private-subnet-1b-id>],
    securityGroups=[<ecs-sg-id>],
    assignPublicIp=DISABLED
  }" \
  --load-balancers "targetGroupArn=<ml-tg-arn>,containerName=ml-service,containerPort=8000" \
  --health-check-grace-period-seconds 60
```

---

### 7. CloudFront Distribution

```bash
# Create CloudFront distribution for frontend
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

`cloudfront-config.json`:
```json
{
  "CallerReference": "datasentry-frontend-2026-09-14",
  "Comment": "DataSentry Frontend Distribution",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-datasentry-frontend",
        "DomainName": "datasentry-frontend-prod.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultRootObject": "index.html",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-datasentry-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
```

---

### 8. Deploy Frontend

```bash
cd frontend

# Build production bundle
npm run build

# Upload to S3
aws s3 sync build/ s3://datasentry-frontend-prod/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id <cloudfront-distribution-id> \
  --paths "/*"
```

---

## Database Migration

```bash
# From backend directory
cd backend

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## Monitoring & Logging

### CloudWatch Log Groups

```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/datasentry-backend
aws logs create-log-group --log-group-name /ecs/datasentry-ml-service

# Set retention
aws logs put-retention-policy \
  --log-group-name /ecs/datasentry-backend \
  --retention-in-days 30

aws logs put-retention-policy \
  --log-group-name /ecs/datasentry-ml-service \
  --retention-in-days 30
```

### CloudWatch Alarms

```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name datasentry-high-error-rate \
  --alarm-description "Alert when error rate is high" \
  --metric-name 5XXError \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold

# Database connection alarm
aws cloudwatch put-metric-alarm \
  --alarm-name datasentry-db-connections \
  --alarm-description "Alert when DB connections are high" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

---

## Auto Scaling

```bash
# Backend auto scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/datasentry-cluster/datasentry-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/datasentry-cluster/datasentry-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'
```

---

## CI/CD with GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push backend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: datasentry/backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster datasentry-cluster \
            --service datasentry-backend \
            --force-new-deployment

  deploy-ml-service:
    runs-on: ubuntu-latest
    steps:
      # Similar steps for ML service
      
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Build frontend
        run: |
          cd frontend
          npm ci
          npm run build
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync frontend/build/ s3://datasentry-frontend-prod/ --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

---

## Cost Estimation

### Monthly Costs (Estimated)

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| ECS Fargate (Backend) | 2 tasks × 0.5 vCPU × 1GB | ~$30 |
| ECS Fargate (ML) | 2 tasks × 1 vCPU × 2GB | ~$60 |
| RDS PostgreSQL | db.t3.micro Multi-AZ | ~$35 |
| S3 (Datasets) | 50GB storage + requests | ~$5 |
| S3 (Frontend) | 1GB + CloudFront | ~$2 |
| ALB | Hours + LCU | ~$25 |
| CloudWatch | Logs + Metrics | ~$10 |
| Data Transfer | 100GB out | ~$9 |
| **Total** | | **~$176/month** |

**Note:** Actual costs depend on usage patterns. Use AWS Cost Explorer for accurate tracking.

---

## Security Best Practices

1. ✅ Use Secrets Manager for all sensitive data
2. ✅ Enable encryption at rest (RDS, S3)
3. ✅ Use private subnets for ECS tasks and RDS
4. ✅ Implement least privilege IAM policies
5. ✅ Enable VPC Flow Logs
6. ✅ Use WAF on ALB (optional, adds cost)
7. ✅ Enable CloudTrail for audit logging
8. ✅ Regularly rotate credentials
9. ✅ Use HTTPS only (obtain SSL certificate via ACM)
10. ✅ Enable MFA on AWS root account

---

## Troubleshooting

### ECS Task Not Starting

```bash
# Check task logs
aws ecs describe-tasks \
  --cluster datasentry-cluster \
  --tasks <task-id>

# Check CloudWatch logs
aws logs tail /ecs/datasentry-backend --follow
```

### Database Connection Issues

```bash
# Test from ECS task
aws ecs execute-command \
  --cluster datasentry-cluster \
  --task <task-id> \
  --container backend \
  --interactive \
  --command "/bin/sh"

# Inside container
nc -zv <rds-endpoint> 5432
```

### S3 Access Denied

```bash
# Verify IAM role policies
aws iam get-role-policy \
  --role-name datasentry-ecs-task-role \
  --policy-name S3DatasetAccess
```

---

## Cleanup (Development)

```bash
# Delete ECS services
aws ecs delete-service --cluster datasentry-cluster --service datasentry-backend --force
aws ecs delete-service --cluster datasentry-cluster --service datasentry-ml-service --force

# Delete ECS cluster
aws ecs delete-cluster --cluster datasentry-cluster

# Delete RDS instance
aws rds delete-db-instance --db-instance-identifier datasentry-db --skip-final-snapshot

# Empty and delete S3 buckets
aws s3 rm s3://datasentry-datasets-prod --recursive
aws s3 rb s3://datasentry-datasets-prod

# Delete ALB and target groups
aws elbv2 delete-load-balancer --load-balancer-arn <alb-arn>
aws elbv2 delete-target-group --target-group-arn <tg-arn>

# Delete CloudFront distribution (must disable first)
# Delete ECR repositories
# Delete VPC and associated resources
```

---

## Next Steps

1. ✅ Configure custom domain with Route 53
2. ✅ Obtain SSL certificate via ACM
3. ✅ Set up WAF rules
4. ✅ Configure backup automation
5. ✅ Set up staging environment
6. ✅ Implement blue-green deployment
7. ✅ Add comprehensive monitoring dashboards

---

*Last Updated: 2026-09-14*
