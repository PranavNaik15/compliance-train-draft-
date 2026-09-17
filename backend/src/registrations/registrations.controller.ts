import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
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
  async getAllRegistrations() {
    return this.registrationsService.findAll();
  }
}
