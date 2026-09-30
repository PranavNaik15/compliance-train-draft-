import { Module } from '@nestjs/common';
import { MembershipsController } from './memberships.controller';
import { MembershipPlansController } from './membership-plans.controller';
import { MembershipsService } from './memberships.service';

@Module({
  controllers: [MembershipsController, MembershipPlansController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
