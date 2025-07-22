import { Module } from '@nestjs/common';
import { PlanningModule } from './planning-poker/app/planning.module';

@Module({
  imports: [PlanningModule],
})
export class AppModule {}
