import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DatasetsService } from './datasets.service';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Datasets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('datasets')
export class DatasetsController {
  constructor(private datasetsService: DatasetsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new dataset' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB max
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const dataset = await this.datasetsService.create({
      name: file.originalname,
      sourceType: this.getSourceType(file.originalname),
      status: 'PROCESSING',
      s3Key: file.filename,
      s3Bucket: 'datasentry-local',
      fileSize: BigInt(file.size),
      user: {
        connect: { id: req.user.id },
      },
    });

    return dataset;
  }

  @Get()
  @ApiOperation({ summary: 'List all datasets' })
  async findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.datasetsService.findAll(
      req.user.id,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dataset by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.datasetsService.findOne(id, req.user.id);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get column profiles for a dataset' })
  async getProfiles(@Param('id') id: string, @Request() req) {
    return this.datasetsService.getProfiles(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete dataset' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.datasetsService.remove(id, req.user.id);
  }

  private getSourceType(filename: string): 'CSV' | 'JSON' | 'EXCEL' {
    const ext = filename.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'csv':
        return 'CSV';
      case 'json':
        return 'JSON';
      case 'xlsx':
      case 'xls':
        return 'EXCEL';
      default:
        return 'CSV';
    }
  }
}
