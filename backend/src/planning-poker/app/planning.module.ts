import { Module } from '@nestjs/common';
import { PlanningGateway } from './planning.gateway';
import { RoomService } from './room/room.service';
import { TaskService } from './task/task.service';
import { PlanningService } from './planning.service';

@Module({
  providers: [PlanningGateway, RoomService, TaskService, PlanningService],
})
export class PlanningModule {}
