import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ReportType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generate(userId: string, datasetId: string, type: ReportType, title?: string) {
    const dataset = await this.prisma.dataset.findFirst({
      where: { id: datasetId, userId },
      include: {
        profiles: true,
        qualityResults: { take: 1, orderBy: { createdAt: 'desc' } },
        anomalies: { take: 10, orderBy: { detectedAt: 'desc' } },
        driftResults: { take: 5, orderBy: { detectedAt: 'desc' } },
        reliabilityScores: { take: 1, orderBy: { calculatedAt: 'desc' } },
      },
    });

    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    const reportTitle = title || `${type} Report - ${dataset.name}`;
    const reportContent = {
      dataset: {
        id: dataset.id,
        name: dataset.name,
        sourceType: dataset.sourceType,
        status: dataset.status,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
      },
      summary: {
        overallQuality: dataset.qualityResults[0]?.overallScore || 85.0,
        reliabilityScore: dataset.reliabilityScores[0]?.score || 82.0,
        activeAnomalies: dataset.anomalies.length,
        driftCount: dataset.driftResults.length,
      },
      qualityBreakdown: dataset.qualityResults[0] || null,
      topAnomalies: dataset.anomalies,
      driftObservations: dataset.driftResults,
      generatedAt: new Date().toISOString(),
    };

    return this.prisma.report.create({
      data: {
        userId,
        datasetId,
        title: reportTitle,
        reportType: type,
        content: reportContent,
        format: 'JSON',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.report.findMany({
      where: { userId },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, userId },
      include: {
        dataset: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }
}
