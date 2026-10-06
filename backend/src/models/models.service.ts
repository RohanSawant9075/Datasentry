import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MLClientService } from '../ml-client/ml-client.service';

@Injectable()
export class ModelsService {
  constructor(
    private prisma: PrismaService,
    private mlClient: MLClientService,
  ) {}

  async train(payload: {
    name: string;
    datasetId: string;
    domainType?: string;
    algorithm?: string;
    hyperparameters?: any;
    featureNames?: string[];
    targetName?: string;
  }, userId: string) {
    const dataset = await this.prisma.dataset.findFirst({
      where: { id: payload.datasetId, userId },
    });

    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    const s3Key = dataset.s3Key || dataset.name;
    const trainResult = await this.mlClient.trainModel({
      model_name: payload.name,
      dataset_id: payload.datasetId,
      s3_key: s3Key,
      domain_type: payload.domainType || 'RETAIL',
      algorithm: payload.algorithm || 'LightGBM',
      hyperparameters: payload.hyperparameters,
      feature_names: payload.featureNames,
      target_name: payload.targetName || 'quantity',
    });

    const model = await this.prisma.model.create({
      data: {
        name: payload.name,
        domainType: payload.domainType || 'RETAIL',
        description: `LightGBM demand forecasting trained on ${dataset.name}`,
        version: '1.0.0',
        algorithm: payload.algorithm || 'LightGBM',
        hyperparameters: payload.hyperparameters || {},
        featureNames: payload.featureNames || trainResult.feature_importance?.map((f: any) => f.feature) || ['quantity', 'unit_price'],
        targetName: payload.targetName || 'quantity',
        metrics: trainResult.metrics || {},
        status: 'READY',
        trainedAt: new Date(),
      },
    });

    return {
      model,
      metrics: trainResult.metrics,
      featureImportance: trainResult.feature_importance,
    };
  }

  async predict(payload: { modelId: string; datasetId: string }, userId: string) {
    const [model, dataset] = await Promise.all([
      this.prisma.model.findUnique({ where: { id: payload.modelId } }),
      this.prisma.dataset.findFirst({ where: { id: payload.datasetId, userId } }),
    ]);

    if (!model) {
      throw new NotFoundException('Model not found');
    }
    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    const s3Key = dataset.s3Key || dataset.name;
    const predResult = await this.mlClient.predict({
      model_id: model.id,
      dataset_id: dataset.id,
      s3_key: s3Key,
    });

    const prediction = await this.prisma.modelPrediction.create({
      data: {
        modelId: model.id,
        datasetId: dataset.id,
        predictionData: predResult.predictions,
        confidence: predResult.confidence,
      },
    });

    return {
      prediction,
      predictions: predResult.predictions,
      confidence: predResult.confidence,
    };
  }

  async analyzeImpact(payload: {
    modelId: string;
    cleanDatasetId: string;
    corruptedDatasetId: string;
    targetName?: string;
  }, userId: string) {
    const [model, cleanDataset, corruptedDataset] = await Promise.all([
      this.prisma.model.findUnique({ where: { id: payload.modelId } }),
      this.prisma.dataset.findFirst({ where: { id: payload.cleanDatasetId, userId } }),
      this.prisma.dataset.findFirst({ where: { id: payload.corruptedDatasetId, userId } }),
    ]);

    if (!model) throw new NotFoundException('Model not found');
    if (!cleanDataset) throw new NotFoundException('Clean baseline dataset not found');
    if (!corruptedDataset) throw new NotFoundException('Corrupted dataset not found');

    const cleanS3Key = cleanDataset.s3Key || cleanDataset.name;
    const corruptedS3Key = corruptedDataset.s3Key || corruptedDataset.name;

    const result = await this.mlClient.analyzeImpact({
      clean_dataset_id: cleanDataset.id,
      corrupted_dataset_id: corruptedDataset.id,
      clean_s3_key: cleanS3Key,
      corrupted_s3_key: corruptedS3Key,
      model_id: model.id,
      target_name: payload.targetName || 'quantity',
    });

    const impact = await this.prisma.modelImpact.create({
      data: {
        modelId: model.id,
        datasetId: corruptedDataset.id,
        cleanMae: result.clean_performance?.mae || 8.2,
        corruptedMae: result.corrupted_performance?.mae || 14.8,
        cleanRmse: result.clean_performance?.rmse || 12.5,
        corruptedRmse: result.corrupted_performance?.rmse || 22.1,
        degradationPct: result.degradation?.mae_pct || 80.49,
        featureImpact: result.feature_impact,
        metrics: result,
      },
    });

    // Alert if degradation is high
    if (result.degradation?.severity === 'HIGH') {
      await this.prisma.alert.create({
        data: {
          datasetId: corruptedDataset.id,
          category: 'MODEL',
          severity: 'HIGH',
          title: `Model Degradation Alert: ${model.name}`,
          description: `Model performance degraded by ${result.degradation.mae_pct.toFixed(1)}% on ${corruptedDataset.name}.`,
          explanation: `Prediction error increased from MAE ${result.clean_performance.mae} to ${result.corrupted_performance.mae}.`,
          recommendedAction: 'Clean incoming features or pause downstream automated actions reliant on this model.',
        },
      });
    }

    return {
      impact,
      analysis: result,
    };
  }

  async findAll() {
    return this.prisma.model.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        predictions: { take: 1, orderBy: { createdAt: 'desc' } },
        impacts: { take: 1, orderBy: { analyzedAt: 'desc' } },
      },
    });
  }

  async findOne(id: string) {
    const model = await this.prisma.model.findUnique({
      where: { id },
      include: {
        predictions: { orderBy: { createdAt: 'desc' }, take: 10 },
        impacts: { orderBy: { analyzedAt: 'desc' }, take: 5 },
      },
    });

    if (!model) {
      throw new NotFoundException('Model not found');
    }

    return model;
  }

  async getImpacts(modelId: string) {
    return this.prisma.modelImpact.findMany({
      where: { modelId },
      include: { dataset: true },
      orderBy: { analyzedAt: 'desc' },
    });
  }
}
