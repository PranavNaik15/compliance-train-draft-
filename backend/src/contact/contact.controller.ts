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
import { ContactService, UpdateContactDto } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createContact(@Body() createContactDto: CreateContactDto & { website?: string }) {
    return this.contactService.create(createContactDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllContacts(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('website') website?: string,
  ) {
    return this.contactService.findAll({ search, status, website });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getContactById(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateContact(
    @Param('id') id: string,
    @Body() updateDto: UpdateContactDto,
  ) {
    return this.contactService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async removeContact(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
