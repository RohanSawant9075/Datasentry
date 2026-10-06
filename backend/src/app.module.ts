import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatasetsModule } from './datasets/datasets.module';
import { QualityModule } from './quality/quality.module';
import { AnomaliesModule } from './anomalies/anomalies.module';
import { DriftModule } from './drift/drift.module';
import { ReliabilityModule } from './reliability/reliability.module';
import { ModelsModule } from './models/models.module';
import { AlertsModule } from './alerts/alerts.module';
import { ReportsModule } from './reports/reports.module';
import { MLClientModule } from './ml-client/ml-client.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
    ]),
    PrismaModule,
    MLClientModule,
    AuthModule,
    UsersModule,
    DatasetsModule,
    QualityModule,
    AnomaliesModule,
    DriftModule,
    ReliabilityModule,
    ModelsModule,
    AlertsModule,
    ReportsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
