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
import { WebsiteContentService } from './website-content.service';
import {
  CreateWebsiteContentDto,
  UpdateWebsiteContentDto,
} from './website-content.interface';

@Controller('website-content')
export class WebsiteContentController {
  constructor(private readonly contentService: WebsiteContentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('website') website?: string,
    @Query('section') section?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.contentService.findAll({ website, section, search, status });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateWebsiteContentDto) {
    return this.contentService.create(createDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWebsiteContentDto,
  ) {
    return this.contentService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
