import { Injectable, OnModuleInit } from '@nestjs/common';
import { Room } from '../app/room/interfaces/room.interface';

@Injectable()
export class CleanupRoomsService implements OnModuleInit {
  private cleanupCallback: (() => void) | null = null;

  // O Gateway registra a função de cleanup
  setCleanupCallback(callback: () => void): void {
    this.cleanupCallback = callback;
  }

  onModuleInit() {
    // Executa a cada 10 minutos (600.000ms)
    setInterval(
      () => {
        if (this.cleanupCallback) {
          this.cleanupCallback();
        }
      },
      10 * 60 * 1000,
    );
  }

  // Método que faz a lógica de cleanup recebendo as salas como parâmetro
  cleanupInactiveRooms(rooms: Map<string, Room>): string[] {
    const now = new Date().getTime();
    const tenMinutesAgo = now - 20 * 60 * 1000;
    const roomsToRemove: string[] = [];

    for (const [roomId, room] of rooms.entries()) {
      if (room.updatedAt && room.updatedAt.getTime() < tenMinutesAgo) {
        roomsToRemove.push(roomId);
      }
    }

    return roomsToRemove; // Retorna lista de IDs para o Gateway remover
  }
}
