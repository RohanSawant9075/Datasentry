import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MLClientService } from '../ml-client/ml-client.service';

@Injectable()
export class ReliabilityService {
  constructor(
    private prisma: PrismaService,
    private mlClient: MLClientService,
  ) {}

  async calculate(datasetId: string, userId: string, customWeights?: Record<string, number>) {
    const dataset = await this.prisma.dataset.findFirst({
      where: { id: datasetId, userId },
      include: {
        qualityResults: { take: 1, orderBy: { createdAt: 'desc' } },
        anomalies: { where: { status: 'ACTIVE' } },
        driftResults: { take: 10, orderBy: { detectedAt: 'desc' } },
      },
    });

    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    const qualityScore = dataset.qualityResults[0]?.overallScore || 85.0;
    const anomalyCount = dataset.anomalies.length;
    const driftCount = dataset.driftResults.length;
    const timelinessScore = dataset.qualityResults[0]?.timelinessScore || 90.0;

    const result = await this.mlClient.calculateReliability({
      dataset_id: datasetId,
      quality_score: qualityScore,
      anomaly_count: anomalyCount,
      drift_count: driftCount,
      timeliness_score: timelinessScore,
      total_rows: dataset.rowCount || 1000,
      weights: customWeights,
    });

    const saved = await this.prisma.reliabilityScore.create({
      data: {
        datasetId,
        score: result.score,
        qualityScore: result.quality_score,
        anomalyScore: result.anomaly_score,
        driftScore: result.drift_score,
        timelinessScore: result.timeliness_score,
        components: result.components,
        version: '1.0.0',
      },
    });

    // Update dataset status
    const status = result.score >= 85 ? 'HEALTHY' : result.score >= 70 ? 'WARNING' : 'CRITICAL';
    await this.prisma.dataset.update({
      where: { id: datasetId },
      data: { status },
    });

    // Generate Alert if Reliability is CRITICAL
    if (result.score < 70) {
      await this.prisma.alert.create({
        data: {
          datasetId,
          category: 'RELIABILITY',
          severity: 'HIGH',
          title: `Critical Reliability Drop: ${dataset.name}`,
          description: `Composite reliability index dropped to ${result.score.toFixed(1)}/100 (${result.risk_level} RISK).`,
          explanation: `Score affected by quality (${result.quality_score.toFixed(1)}), anomalies (${result.anomaly_score.toFixed(1)}), and drift (${result.drift_score.toFixed(1)}).`,
          recommendedAction: 'Review downstream machine learning models and pause automated decision triggers.',
        },
      });
    }

    return saved;
  }

  async getLatest(datasetId: string, userId: string) {
    const dataset = await this.prisma.dataset.findFirst({
      where: { id: datasetId, userId },
    });
    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    const latest = await this.prisma.reliabilityScore.findFirst({
      where: { datasetId },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!latest) {
      return this.calculate(datasetId, userId);
    }

    return latest;
  }

  async getHistory(datasetId: string, userId: string) {
    const dataset = await this.prisma.dataset.findFirst({
      where: { id: datasetId, userId },
    });
    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    return this.prisma.reliabilityScore.findMany({
      where: { datasetId },
      orderBy: { calculatedAt: 'desc' },
      take: 20,
    });
  }
}
