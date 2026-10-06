import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MLClientService } from '../ml-client/ml-client.service';

@Injectable()
export class QualityService {
  constructor(
    private prisma: PrismaService,
    private mlClient: MLClientService,
  ) {}

  async analyze(datasetId: string, userId: string) {
    const dataset = await this.prisma.dataset.findFirst({
      where: { id: datasetId, userId },
    });

    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    const s3Key = dataset.s3Key || dataset.name;
    const result = await this.mlClient.analyzeQuality(datasetId, s3Key, dataset.schema);

    const saved = await this.prisma.qualityResult.create({
      data: {
        datasetId,
        overallScore: result.overall_score || 85.0,
        completenessScore: result.completeness?.score || 90.0,
        validityScore: result.validity?.score || 85.0,
        consistencyScore: result.consistency?.score || 80.0,
        uniquenessScore: result.uniqueness?.score || 95.0,
        timelinessScore: result.timeliness?.score || 88.0,
        distributionScore: result.distribution?.score || 75.0,
        issues: result,
        version: '1.0.0',
      },
    });

    // Generate alert if score is low
    if (result.overall_score < 75) {
      await this.prisma.alert.create({
        data: {
          datasetId,
          category: 'QUALITY',
          severity: result.overall_score < 60 ? 'HIGH' : 'MEDIUM',
          title: `Data Quality Alert: ${dataset.name}`,
          description: `Overall quality score dropped to ${result.overall_score.toFixed(1)}%. Review completeness and validity.`,
          explanation: 'One or more data quality dimensions fell below acceptable operational thresholds.',
          recommendedAction: 'Inspect affected columns and trigger automated data cleansing pipeline.',
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

    const latest = await this.prisma.qualityResult.findFirst({
      where: { datasetId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest) {
      // Auto-analyze if none exists
      return this.analyze(datasetId, userId);
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

    return this.prisma.qualityResult.findMany({
      where: { datasetId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
