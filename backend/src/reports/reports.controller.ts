import { Controller, Get, Post, Param, Body, UseGuards, Request, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { ReportType } from '@prisma/client';
import { Response } from 'express';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new report' })
  async generate(
    @Body('datasetId') datasetId: string,
    @Body('type') type: ReportType,
    @Body('title') title: string,
    @Request() req,
  ) {
    return this.reportsService.generate(req.user.id, datasetId, type, title);
  }

  @Get()
  @ApiOperation({ summary: 'List all generated reports' })
  async findAll(@Request() req) {
    return this.reportsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.reportsService.findOne(id, req.user.id);
  }

  @Get(':id/export')
  @Header('Content-Type', 'application/json')
  @ApiOperation({ summary: 'Export report as JSON' })
  async export(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const report = await this.reportsService.findOne(id, req.user.id);
    res.setHeader('Content-Disposition', `attachment; filename="${report.id}_report.json"`);
    res.json(report);
  }
}
