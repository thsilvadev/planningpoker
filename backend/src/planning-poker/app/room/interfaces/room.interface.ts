import { Participant } from '../../participant/interfaces/participant.interface';
import { Task } from '../../task/interfaces/task.interface';

export interface Room {
  id: string;
  creator: string;
  participants: Participant[];
  tasks: Task[];
  votesRevealed: boolean;
  currentTaskId?: string;
}
