import { Module } from '@nestjs/common';
import { PlanningGateway } from './planning.gateway';
import { RoomService } from './room/room.service';
import { TaskService } from './task/task.service';
import { PlanningService } from './planning.service';
import { CleanupRoomsService } from '../utils/cleanupRooms.service';
import { RoomSanitizerService } from '../utils/roomSanitizer.service';

@Module({
  providers: [
    PlanningGateway,
    RoomService,
    TaskService,
    PlanningService,
    CleanupRoomsService,
    RoomSanitizerService,
  ],
})
export class PlanningModule {}
