import { Controller, Get, Param } from '@nestjs/common';
import { WebinarsService } from './webinars.service';

@Controller('webinars')
export class WebinarsController {
  constructor(private readonly webinarsService: WebinarsService) {}

  @Get()
  async getAllWebinars() {
    return this.webinarsService.findAll();
  }

  @Get(':id')
  async getWebinarById(@Param('id') id: string) {
    return this.webinarsService.findOne(id);
  }
}
