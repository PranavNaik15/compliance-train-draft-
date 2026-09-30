import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { UpdateSubscriptionDto } from './memberships.interface';

@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMemberships(
    @Query('admin') admin?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('planId') planId?: string,
    @Query('userId') userId?: string,
  ) {
    if (admin === 'true' || search || status || type || planId || userId) {
      return this.membershipsService.findAllSubscriptions({ search, type, status, planId, userId });
    }
    return this.membershipsService.getCategoriesWithPlans();
  }

  @Get('subscriptions')
  @HttpCode(HttpStatus.OK)
  async getAllSubscriptions(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('planId') planId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.membershipsService.findAllSubscriptions({ search, type, status, planId, userId });
  }

  @Get(':id')
  async getMembershipById(@Param('id') id: string) {
    if (id.startsWith('MEM-') || id.startsWith('sub-')) {
      return this.membershipsService.findOneSubscription(id);
    }
    const categories = this.membershipsService.getCategoriesWithPlans();
    const found = categories.data.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (found) {
      return { success: true, data: found };
    }
    try {
      return await this.membershipsService.findOneSubscription(id);
    } catch {
      return { success: true, data: categories.data[0] };
    }
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  async subscribe(@Request() req: any, @Body() body: any) {
    const user = req.user || {
      id: body.userId || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: body.userName || body.name || 'Valued Healthcare Member',
      email: body.email || body.userEmail || 'member@compliancetrain.org',
    };
    return this.membershipsService.subscribe(user, body);
  }

  @Patch(':id')
  async updateSubscription(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionDto,
  ) {
    return this.membershipsService.updateSubscription(id, updateDto);
  }

  @Delete(':id')
  async deleteSubscription(@Param('id') id: string) {
    return this.membershipsService.removeSubscription(id);
  }
}
