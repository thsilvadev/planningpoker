import { Injectable } from '@nestjs/common';
import { Room } from './interfaces/room.interface';
import { v4 as uuid } from 'uuid';
import { Participant } from '../participant/interfaces/participant.interface';

@Injectable()
export class RoomService {
  //No início do serviço, inicializar um Map para armazenar as salas
  private rooms: Map<string, Room> = new Map();
  //Sala aqui é o que chamaremos o objeto que armazena o estado atual de uma sala de planning poker (votos, participantes, tarefas...)
  //Não é uma socket room -> essa chamaremos de Sessão para diferenciá-las.

  //Métodos

  createRoom(moderatorName: string, clientId: string): Room {
    // Criar uma nova sala com um ID único e o nome do moderador
    const newRoom: Room = {
      id: uuid(),
      creator: moderatorName,
      creatorId: clientId,
      participants: [],
      tasks: [],
      votingStatus: { status: 'idle' }, // Estado inicial da votação
      updatedAt: new Date(), // Data de criação da sala
    };

    // Adicionar a nova sala ao mapa de salas
    this.rooms.set(newRoom.id, newRoom);
    return newRoom;
  }

  getRoom(roomId: string): Room | undefined {
    const currentRoom = this.rooms.get(roomId);
    if (currentRoom) {
      //Atualiza a atividade da sala => para mensurar inatividade => para limpar salas inativas automaticamente.
      currentRoom.updatedAt = new Date();
    }
    return currentRoom;
  }

  addParticipant(
    roomId: string,
    participantName: string,
  ): { newRoomState: Room; participantId: string } | undefined {
    const room = this.getRoom(roomId);
    if (room) {
      const participant: Participant = {
        id: uuid(),
        name: participantName,
        hasVoted: false,
      };
      room.participants.push(participant);
      return { newRoomState: room, participantId: participant.id };
    }
  }

  // Método para acessar todas as salas (necessário para o cleanup)
  getAllRooms(): Map<string, Room> {
    return this.rooms;
  }

  // Método para remover uma sala específica
  removeRoom(roomId: string): boolean {
    return this.rooms.delete(roomId);
  }

  getRoomByParticipantId(participantId: string | string[]): Room | undefined {
    for (const room of this.rooms.values()) {
      if (
        room.participants.some(
          (participant) => participant.id === participantId,
        )
      ) {
        return room;
      }
    }
    return undefined;
  }

  getRoomByCreatorId(creatorId: string | string[]): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.creatorId === creatorId) {
        return room;
      }
    }
    return undefined;
  }

  removeParticipant(roomId: string, participantId: string): Room | undefined {
    const room = this.getRoom(roomId);
    if (room) {
      room.participants = room.participants.filter(
        (participant) => participant.id !== participantId,
      );
      return room;
    }
    return undefined;
  }
}
