import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReliabilityService } from './reliability.service';

@ApiTags('Reliability')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reliability')
export class ReliabilityController {
  constructor(private reliabilityService: ReliabilityService) {}

  @Post('calculate/:datasetId')
  @ApiOperation({ summary: 'Calculate reliability score for dataset' })
  async calculate(
    @Param('datasetId') datasetId: string,
    @Body('weights') weights: Record<string, number>,
    @Request() req,
  ) {
    return this.reliabilityService.calculate(datasetId, req.user.id, weights);
  }

  @Get(':datasetId')
  @ApiOperation({ summary: 'Get latest reliability score for dataset' })
  async getLatest(@Param('datasetId') datasetId: string, @Request() req) {
    return this.reliabilityService.getLatest(datasetId, req.user.id);
  }

  @Get('history/:datasetId')
  @ApiOperation({ summary: 'Get reliability score history for dataset' })
  async getHistory(@Param('datasetId') datasetId: string, @Request() req) {
    return this.reliabilityService.getHistory(datasetId, req.user.id);
  }
}
