import { Participant } from '../../participant/interfaces/participant.interface';
import { Task } from '../../task/interfaces/task.interface';

export type VotingStatus =
  | { status: 'idle' } // Nenhuma tarefa está sendo votada
  | { status: 'voting'; taskId: string } // Tarefa em votação
  | { status: 'revealed'; taskId: string }; // Votação revelada

export interface Room {
  id: string;
  creator: string;
  creatorId: string;
  participants: Participant[];
  tasks: Task[];
  votingStatus: VotingStatus;
  updatedAt?: Date; // Data de atualização da sala
}
