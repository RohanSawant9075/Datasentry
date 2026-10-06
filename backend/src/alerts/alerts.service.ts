import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AlertStatus, Severity, AlertCategory } from '@prisma/client';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    status?: AlertStatus,
    severity?: Severity,
    category?: AlertCategory,
  ) {
    return this.prisma.alert.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(severity ? { severity } : {}),
        ...(category ? { category } : {}),
        OR: [
          { dataset: { userId } },
          { datasetId: null },
        ],
      },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getStats(userId: string) {
    const [total, active, critical, high] = await Promise.all([
      this.prisma.alert.count({
        where: {
          OR: [{ dataset: { userId } }, { datasetId: null }],
        },
      }),
      this.prisma.alert.count({
        where: {
          status: 'NEW',
          OR: [{ dataset: { userId } }, { datasetId: null }],
        },
      }),
      this.prisma.alert.count({
        where: {
          status: 'NEW',
          severity: 'CRITICAL',
          OR: [{ dataset: { userId } }, { datasetId: null }],
        },
      }),
      this.prisma.alert.count({
        where: {
          status: 'NEW',
          severity: 'HIGH',
          OR: [{ dataset: { userId } }, { datasetId: null }],
        },
      }),
    ]);

    return {
      total,
      active,
      critical,
      high,
    };
  }

  async acknowledge(id: string, userId: string) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Alert not found');

    return this.prisma.alert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      },
    });
  }

  async resolve(id: string, userId: string) {
    const alert = await this.prisma.alert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundException('Alert not found');

    return this.prisma.alert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedBy: userId,
        resolvedAt: new Date(),
      },
    });
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.alert.updateMany({
      where: {
        status: 'NEW',
        OR: [
          { dataset: { userId } },
          { datasetId: null },
        ],
      },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      },
    });

    return { updated: result.count };
  }

  async create(data: {
    datasetId?: string;
    category: AlertCategory;
    severity: Severity;
    title: string;
    description: string;
    explanation?: string;
    recommendedAction?: string;
  }) {
    return this.prisma.alert.create({
      data: {
        ...data,
        status: 'NEW',
      },
    });
  }
}
