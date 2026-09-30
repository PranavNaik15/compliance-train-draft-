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
import { WebinarsService } from './webinars.service';

@Controller('webinars')
export class WebinarsController {
  constructor(private readonly webinarsService: WebinarsService) {}

  @Get()
  async getAllWebinars(
    @Query('site') site?: string,
    @Query('admin') admin?: string,
    @Query('type') type?: string,
  ) {
    return this.webinarsService.findAll({ site, admin, type });
  }

  @Get(':id')
  async getWebinarById(@Param('id') id: string) {
    return this.webinarsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWebinar(@Body() createWebinarDto: any) {
    return this.webinarsService.create(createWebinarDto);
  }

  @Patch(':id')
  async updateWebinar(
    @Param('id') id: string,
    @Body() updateWebinarDto: any,
  ) {
    return this.webinarsService.update(id, updateWebinarDto);
  }

  @Delete(':id')
  async deleteWebinar(@Param('id') id: string) {
    return this.webinarsService.remove(id);
  }
}
