import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OnsiteTrainingService } from './onsite-training.service';
import { CreateOnsiteTrainingDto } from './dto/create-onsite-training.dto';

@Controller('onsite-training')
export class OnsiteTrainingController {
  constructor(private readonly onsiteTrainingService: OnsiteTrainingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOnsiteRequest(@Body() createDto: CreateOnsiteTrainingDto) {
    return this.onsiteTrainingService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllOnsiteRequests() {
    return this.onsiteTrainingService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOnsiteRequestById(@Param('id') id: string) {
    return this.onsiteTrainingService.findOne(id);
  }
}
