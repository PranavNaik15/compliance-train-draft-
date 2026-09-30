import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SpeakersService } from './speakers.service';
import { CreateSpeakerDto, UpdateSpeakerDto } from './speakers.interface';

@Controller('speakers')
export class SpeakersController {
  constructor(private readonly speakersService: SpeakersService) {}

  @Get()
  async getAllSpeakers(
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.speakersService.findAll({ search, status });
  }

  @Get(':id')
  async getSpeakerById(@Param('id') id: string) {
    return this.speakersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSpeaker(@Body() createSpeakerDto: CreateSpeakerDto) {
    return this.speakersService.create(createSpeakerDto);
  }

  @Patch(':id')
  async updateSpeaker(
    @Param('id') id: string,
    @Body() updateSpeakerDto: UpdateSpeakerDto,
  ) {
    return this.speakersService.update(id, updateSpeakerDto);
  }

  @Delete(':id')
  async deleteSpeaker(@Param('id') id: string) {
    return this.speakersService.remove(id);
  }
}
