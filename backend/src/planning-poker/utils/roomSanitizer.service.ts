import { Injectable } from '@nestjs/common';
import { Room } from '../app/room/interfaces/room.interface';

export interface SanitizedRoom {
  id: string;
  creator: string;
  participants: Array<{
    name: string;
    hasVoted: boolean; // Mudança: de vote para hasVoted
  }>;
  tasks: Room['tasks'];
  votingStatus: Room['votingStatus'];
  updatedAt?: Date;
}

@Injectable()
export class RoomSanitizerService {
  sanitizeRoom(room: Room): SanitizedRoom {
    return {
      id: room.id,
      creator: room.creator,
      participants: room.participants.map((participant) => ({
        name: participant.name,
        hasVoted: participant.hasVoted,
        // Remove o participant.id
      })),
      tasks: room.tasks,
      votingStatus: room.votingStatus,
      updatedAt: room.updatedAt,
      // Remove o creatorId
    };
  }
}
