import { Controller, Get, Patch, Param, Query, UseGuards, Request, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AlertsService } from './alerts.service';
import { AlertStatus, Severity, AlertCategory } from '@prisma/client';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List all alerts with optional filtering' })
  async findAll(
    @Query('status') status: AlertStatus,
    @Query('severity') severity: Severity,
    @Query('category') category: AlertCategory,
    @Request() req,
  ) {
    return this.alertsService.findAll(req.user.id, status, severity, category);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get summary statistics of alerts' })
  async getStats(@Request() req) {
    return this.alertsService.getStats(req.user.id);
  }

  @Patch(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an active alert' })
  async acknowledge(@Param('id') id: string, @Request() req) {
    return this.alertsService.acknowledge(id, req.user.id);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Resolve an active alert' })
  async resolve(@Param('id') id: string, @Request() req) {
    return this.alertsService.resolve(id, req.user.id);
  }

  @Patch('mark-all-read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark all alerts as acknowledged' })
  async markAllRead(@Request() req) {
    return this.alertsService.markAllRead(req.user.id);
  }
}
