import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { SubscribeMembershipDto } from './dto/subscribe.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  async getAllMemberships() {
    return this.membershipsService.findAll();
  }

  @Get(':id')
  async getMembershipById(@Param('id') id: string) {
    return this.membershipsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Request() req: any, @Body() subscribeDto: SubscribeMembershipDto) {
    return this.membershipsService.subscribe(req.user, subscribeDto);
  }
}
