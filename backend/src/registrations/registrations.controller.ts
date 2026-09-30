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
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Controller('register')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createRegistrationDto: CreateRegistrationDto) {
    return this.registrationsService.create(createRegistrationDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllRegistrations(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('website') website?: string,
    @Query('webinarId') webinarId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.registrationsService.findAll({ search, status, website, webinarId, userId });
  }

  @Get(':id')
  async getRegistrationById(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @Patch(':id')
  async updateRegistration(
    @Param('id') id: string,
    @Body() body: { status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' },
  ) {
    return this.registrationsService.update(id, body);
  }

  @Delete(':id')
  async deleteRegistration(@Param('id') id: string) {
    return this.registrationsService.remove(id);
  }
}
