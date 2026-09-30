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
import { MembershipsService } from './memberships.service';
import { CreateMembershipPlanDto, UpdateMembershipPlanDto } from './memberships.interface';

@Controller('membership-plans')
export class MembershipPlansController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllPlans(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.membershipsService.findAllPlans({ search, type, status });
  }

  @Get(':id')
  async getPlanById(@Param('id') id: string) {
    return this.membershipsService.findOnePlan(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPlan(@Body() createPlanDto: CreateMembershipPlanDto) {
    return this.membershipsService.createPlan(createPlanDto);
  }

  @Patch(':id')
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdateMembershipPlanDto,
  ) {
    return this.membershipsService.updatePlan(id, updatePlanDto);
  }

  @Delete(':id')
  async deletePlan(@Param('id') id: string) {
    return this.membershipsService.deletePlan(id);
  }
}
