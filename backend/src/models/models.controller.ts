import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ModelsService } from './models.service';

@ApiTags('Models')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('models')
export class ModelsController {
  constructor(private modelsService: ModelsService) {}

  @Post('train')
  @ApiOperation({ summary: 'Train a machine learning model' })
  async train(
    @Body()
    body: {
      name: string;
      datasetId: string;
      domainType?: string;
      algorithm?: string;
      hyperparameters?: any;
      featureNames?: string[];
      targetName?: string;
    },
    @Request() req,
  ) {
    return this.modelsService.train(body, req.user.id);
  }

  @Post('predict')
  @ApiOperation({ summary: 'Make predictions using trained model' })
  async predict(
    @Body() body: { modelId: string; datasetId: string },
    @Request() req,
  ) {
    return this.modelsService.predict(body, req.user.id);
  }

  @Post('impact')
  @ApiOperation({ summary: 'Analyze model performance degradation due to data quality' })
  async analyzeImpact(
    @Body()
    body: {
      modelId: string;
      cleanDatasetId: string;
      corruptedDatasetId: string;
      targetName?: string;
    },
    @Request() req,
  ) {
    return this.modelsService.analyzeImpact(body, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all trained models' })
  async findAll() {
    return this.modelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get model by ID' })
  async findOne(@Param('id') id: string) {
    return this.modelsService.findOne(id);
  }

  @Get(':id/impacts')
  @ApiOperation({ summary: 'Get impact evaluations for a model' })
  async getImpacts(@Param('id') id: string) {
    return this.modelsService.getImpacts(id);
  }
}
