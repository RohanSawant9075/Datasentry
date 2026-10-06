import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DriftService } from './drift.service';

@ApiTags('Drift')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('drift')
export class DriftController {
  constructor(private driftService: DriftService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze drift between two datasets' })
  async analyze(
    @Body('currentDatasetId') currentDatasetId: string,
    @Body('referenceDatasetId') referenceDatasetId: string,
    @Request() req,
  ) {
    return this.driftService.analyze(currentDatasetId, referenceDatasetId, req.user.id);
  }

  @Get('dataset/:datasetId')
  @ApiOperation({ summary: 'Get drift results for a dataset' })
  async findByDataset(@Param('datasetId') datasetId: string, @Request() req) {
    return this.driftService.findByDataset(datasetId, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all drift results for user' })
  async findAll(@Request() req) {
    return this.driftService.findAll(req.user.id);
  }
}
