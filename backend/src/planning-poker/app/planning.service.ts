import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class PlanningService {
  joinSession(client: Socket, roomId: string): boolean {
    // O método .join() do Socket.IO retorna uma Promise<void> | void e por causa disso tem que fazer essa manobra para encapsular ele em try/catch.
    try {
      const joinSession = client.join(roomId);
      if (joinSession instanceof Promise) {
        joinSession.catch((error) => {
          console.error(`Error joining room ${roomId}:`, error);
        });
      }
      return true;
    } catch (error) {
      console.error(`Error joining room ${roomId}:`, error);
      return false;
    }
  }

  async removeSession(roomId: string, server: Server): Promise<void> {
    try {
      const sockets = await server.in(roomId).fetchSockets();
      for (const socket of sockets) {
        socket.leave(roomId);
      }
    } catch (error) {
      console.error(`Error leaving room ${roomId}:`, error);
    }
  }
}

//Nota: a criação de uma sala socket.IO (Sessão) não tem um método próprio -- ela acontece quando o primeiro client entra nela atraǘes do .join()
