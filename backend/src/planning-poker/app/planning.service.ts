import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class PlanningService {
  joinSession(client: Socket, roomId: string): void {
    try {
      const joinSession = client.join(roomId);
      if (joinSession instanceof Promise) {
        joinSession.catch((error) => {
          console.error(`Error joining room ${roomId}:`, error);
        });
      }
    } catch (error) {
      console.error(`Error joining room ${roomId}:`, error);
    }
  }
}
