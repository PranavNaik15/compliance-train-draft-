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
import { SupportService, UpdateSupportDto } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSupportTicket(@Body() createDto: CreateSupportDto & { website?: string; priority?: string }) {
    return this.supportService.create(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllSupportTickets(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('website') website?: string,
  ) {
    return this.supportService.findAll({ search, status, priority, category, website });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getSupportTicketById(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateSupportTicket(
    @Param('id') id: string,
    @Body() updateDto: UpdateSupportDto,
  ) {
    return this.supportService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeSupportTicket(@Param('id') id: string) {
    return this.supportService.remove(id);
  }
}
