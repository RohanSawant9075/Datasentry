import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnomaliesService } from './anomalies.service';
import { Severity } from '@prisma/client';

@ApiTags('Anomalies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('anomalies')
export class AnomaliesController {
  constructor(private anomaliesService: AnomaliesService) {}

  @Post('detect/:datasetId')
  @ApiOperation({ summary: 'Run anomaly detection on dataset' })
  async detect(
    @Param('datasetId') datasetId: string,
    @Body('contamination') contamination: number,
    @Request() req,
  ) {
    return this.anomaliesService.detect(datasetId, req.user.id, contamination);
  }

  @Get('dataset/:datasetId')
  @ApiOperation({ summary: 'Get anomalies for a specific dataset' })
  async findByDataset(
    @Param('datasetId') datasetId: string,
    @Query('severity') severity: Severity,
    @Request() req,
  ) {
    return this.anomaliesService.findByDataset(datasetId, req.user.id, severity);
  }

  @Get()
  @ApiOperation({ summary: 'List all anomalies across user datasets' })
  async findAll(
    @Query('severity') severity: Severity,
    @Query('status') status: string,
    @Request() req,
  ) {
    return this.anomaliesService.findAll(req.user.id, severity, status);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve an anomaly' })
  async resolve(@Param('id') id: string, @Request() req) {
    return this.anomaliesService.resolve(id, req.user.id);
  }
}
