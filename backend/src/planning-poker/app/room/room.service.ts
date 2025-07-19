import { Injectable } from '@nestjs/common';
import { Room } from './interfaces/room.interface';
import { v4 as uuid } from 'uuid';
import { Participant } from '../participant/interfaces/participant.interface';

@Injectable()
export class RoomService {
  //No início do serviço, inicializar um mapa para armazenar as salas
  private rooms: Map<string, Room> = new Map();

  createRoom(moderatorName: string): Room {
    // Criar uma nova sala com um ID único e o nome do moderador
    const newRoom: Room = {
      id: uuid(),
      creator: moderatorName,
      participants: [],
      tasks: [],
      votesRevealed: false,
      currentTaskId: undefined,
    };

    // Adicionar a nova sala ao mapa de salas
    this.rooms.set(newRoom.id, newRoom);
    return newRoom;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  addParticipant(roomId: string, participantName: string): Room | undefined {
    const room = this.getRoom(roomId);
    if (room) {
      const participant: Participant = {
        id: uuid(),
        name: participantName,
        vote: undefined,
        hasVoted: false,
      };
      room.participants.push(participant);
      return room;
    }
  }
}
