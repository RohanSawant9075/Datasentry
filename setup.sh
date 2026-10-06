#!/bin/bash

# DataSentry-AI Project Setup Script
# Creates all necessary directories for the project

echo "Setting up DataSentry-AI project structure..."

# Main directories
mkdir -p frontend/src/{components,layouts,pages,services,hooks,types,utils,styles}
mkdir -p frontend/src/features/{dashboard,datasets,quality,anomalies,models,impact,decisions,alerts,reports}
mkdir -p frontend/public

mkdir -p backend/src/{auth,users,datasets,ingestion,storage,quality,anomalies,drift,reliability,models,impact,decisions,alerts,reports,audit}
mkdir -p backend/src/common/{guards,decorators,filters,interceptors,pipes}
mkdir -p backend/{prisma,test}

mkdir -p ml-service/app/{api,profiling,quality,anomaly,drift,reliability,preprocessing,models,impact,decisions,explainability,common}
mkdir -p ml-service/{trained_models,tests}

mkdir -p datasets/{raw,processed,corrupted,sample}
mkdir -p experiments/{corruption,results,notebooks,evaluation}
mkdir -p infrastructure/{docker,aws,github-actions}

# Create .gitkeep files to preserve empty directories
touch datasets/raw/.gitkeep
touch datasets/processed/.gitkeep
touch datasets/corrupted/.gitkeep
touch datasets/sample/.gitkeep
touch ml-service/trained_models/.gitkeep
touch experiments/results/.gitkeep
touch experiments/corruption/.gitkeep
touch experiments/notebooks/.gitkeep

echo "✓ Directory structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your environment variables"
echo "2. Install dependencies for each service"
echo "3. Run 'docker compose up' to start all services"
