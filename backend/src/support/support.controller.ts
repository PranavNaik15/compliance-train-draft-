import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSupportTicket(@Body() createDto: CreateSupportDto) {
    return this.supportService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllSupportTickets() {
    return this.supportService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getSupportTicketById(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }
}
