import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MLClientService } from '../ml-client/ml-client.service';
import { Severity, DriftType } from '@prisma/client';

@Injectable()
export class DriftService {
  constructor(
    private prisma: PrismaService,
    private mlClient: MLClientService,
  ) {}

  async analyze(currentDatasetId: string, referenceDatasetId: string, userId: string) {
    const [current, reference] = await Promise.all([
      this.prisma.dataset.findFirst({ where: { id: currentDatasetId, userId } }),
      this.prisma.dataset.findFirst({ where: { id: referenceDatasetId, userId } }),
    ]);

    if (!current) {
      throw new NotFoundException('Current dataset not found');
    }
    if (!reference) {
      throw new NotFoundException('Reference dataset not found');
    }

    const currentS3Key = current.s3Key || current.name;
    const referenceS3Key = reference.s3Key || reference.name;

    const result = await this.mlClient.analyzeDrift(
      currentDatasetId,
      referenceDatasetId,
      currentS3Key,
      referenceS3Key,
    );

    const createdDrifts = [];
    if (result && result.drifts) {
      for (const d of result.drifts) {
        const drift = await this.prisma.driftResult.create({
          data: {
            datasetId: currentDatasetId,
            referenceDatasetId,
            columnName: d.column_name,
            driftType: d.drift_type as DriftType,
            driftMetric: d.drift_metric || 'PSI',
            driftScore: d.drift_score || 0.0,
            severity: d.severity as Severity,
            referenceStats: d.reference_stats || null,
            currentStats: d.current_stats || null,
          },
        });
        createdDrifts.push(drift);

        if (d.severity === 'HIGH' || d.severity === 'CRITICAL') {
          await this.prisma.alert.create({
            data: {
              datasetId: currentDatasetId,
              category: 'DRIFT',
              severity: d.severity as Severity,
              title: `High Data Drift: ${d.column_name}`,
              description: `Severe distribution drift detected in ${d.column_name} (PSI: ${d.drift_score}).`,
              explanation: d.explanation,
              recommendedAction: 'Trigger model retraining with current data distribution.',
            },
          });
        }
      }
    }

    return {
      currentDatasetId,
      referenceDatasetId,
      totalDrifts: createdDrifts.length,
      drifts: createdDrifts,
    };
  }

  async findByDataset(datasetId: string, userId: string) {
    const dataset = await this.prisma.dataset.findFirst({
      where: { id: datasetId, userId },
    });
    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    return this.prisma.driftResult.findMany({
      where: { datasetId },
      orderBy: { detectedAt: 'desc' },
    });
  }

  async findAll(userId: string) {
    return this.prisma.driftResult.findMany({
      where: { dataset: { userId } },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { detectedAt: 'desc' },
      take: 100,
    });
  }
}
