import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OnsiteTrainingService, UpdateOnsiteTrainingDto } from './onsite-training.service';
import { CreateOnsiteTrainingDto } from './dto/create-onsite-training.dto';

@Controller('onsite-training')
export class OnsiteTrainingController {
  constructor(private readonly onsiteService: OnsiteTrainingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOnsiteTraining(
    @Body() createDto: CreateOnsiteTrainingDto & { website?: string; organization?: string; participants?: string; trainingTopic?: string },
  ) {
    return this.onsiteService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllOnsiteRequests(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('website') website?: string,
  ) {
    return this.onsiteService.findAll({ search, status, website });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getOnsiteRequestById(@Param('id') id: string) {
    return this.onsiteService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateOnsiteRequest(
    @Param('id') id: string,
    @Body() updateDto: UpdateOnsiteTrainingDto,
  ) {
    return this.onsiteService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeOnsiteRequest(@Param('id') id: string) {
    return this.onsiteService.remove(id);
  }
}
