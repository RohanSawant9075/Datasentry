import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QualityService } from './quality.service';

@ApiTags('Quality')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quality')
export class QualityController {
  constructor(private qualityService: QualityService) {}

  @Post('analyze/:datasetId')
  @ApiOperation({ summary: 'Run quality analysis on dataset' })
  async analyze(@Param('datasetId') datasetId: string, @Request() req) {
    return this.qualityService.analyze(datasetId, req.user.id);
  }

  @Get(':datasetId')
  @ApiOperation({ summary: 'Get latest quality analysis result for dataset' })
  async getLatest(@Param('datasetId') datasetId: string, @Request() req) {
    return this.qualityService.getLatest(datasetId, req.user.id);
  }

  @Get('history/:datasetId')
  @ApiOperation({ summary: 'Get quality history for dataset' })
  async getHistory(@Param('datasetId') datasetId: string, @Request() req) {
    return this.qualityService.getHistory(datasetId, req.user.id);
  }
}
