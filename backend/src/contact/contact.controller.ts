import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createContact(@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllContacts() {
    return this.contactService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getContactById(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }
}
