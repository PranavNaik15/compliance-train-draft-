import { Module } from '@nestjs/common';
import { OnsiteTrainingController } from './onsite-training.controller';
import { OnsiteTrainingService } from './onsite-training.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [OnsiteTrainingController],
  providers: [OnsiteTrainingService],
  exports: [OnsiteTrainingService],
})
export class OnsiteTrainingModule {}
