import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MLClientService } from '../ml-client/ml-client.service';
import { Severity, AnomalyType } from '@prisma/client';

@Injectable()
export class AnomaliesService {
  constructor(
    private prisma: PrismaService,
    private mlClient: MLClientService,
  ) {}

  async detect(datasetId: string, userId: string, contamination = 0.05) {
    const dataset = await this.prisma.dataset.findFirst({
      where: { id: datasetId, userId },
    });

    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    const s3Key = dataset.s3Key || dataset.name;
    const result = await this.mlClient.detectAnomalies(datasetId, s3Key, contamination);

    const createdAnomalies = [];
    if (result && result.anomalies) {
      for (const a of result.anomalies) {
        const created = await this.prisma.anomaly.create({
          data: {
            datasetId,
            columnName: a.column_name,
            anomalyType: a.anomaly_type as AnomalyType,
            severity: a.severity as Severity,
            affectedCount: a.affected_count || 1,
            affectedRows: a.affected_rows || [],
            method: a.method || 'IsolationForest',
            threshold: a.threshold || null,
            explanation: a.explanation || 'Statistical anomaly detected',
          },
        });
        createdAnomalies.push(created);

        // Alert on High or Critical anomalies
        if (a.severity === 'HIGH' || a.severity === 'CRITICAL') {
          await this.prisma.alert.create({
            data: {
              datasetId,
              category: 'ANOMALY',
              severity: a.severity as Severity,
              title: `High Anomaly Detected: ${a.column_name}`,
              description: a.explanation || `Significant anomaly in ${a.column_name} affecting ${a.affected_count} records.`,
              explanation: `Detection method ${a.method} found deviation beyond threshold.`,
              recommendedAction: 'Quarantine affected records or verify sensor/source data accuracy.',
            },
          });
        }
      }
    }

    return {
      datasetId,
      totalDetected: createdAnomalies.length,
      anomalies: createdAnomalies,
    };
  }

  async findByDataset(datasetId: string, userId: string, severity?: Severity) {
    const dataset = await this.prisma.dataset.findFirst({
      where: { id: datasetId, userId },
    });
    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    return this.prisma.anomaly.findMany({
      where: {
        datasetId,
        ...(severity ? { severity } : {}),
      },
      orderBy: { detectedAt: 'desc' },
    });
  }

  async findAll(userId: string, severity?: Severity, status?: string) {
    return this.prisma.anomaly.findMany({
      where: {
        dataset: { userId },
        ...(severity ? { severity } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { detectedAt: 'desc' },
      take: 100,
    });
  }

  async resolve(id: string, userId: string) {
    const anomaly = await this.prisma.anomaly.findFirst({
      where: {
        id,
        dataset: { userId },
      },
    });

    if (!anomaly) {
      throw new NotFoundException('Anomaly not found');
    }

    return this.prisma.anomaly.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });
  }
}
