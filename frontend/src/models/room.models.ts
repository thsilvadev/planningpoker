// ROOM

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
  votingStatus: VotingStatus; // Não precisava ter pois já tem Task.status = TaskStatus. É conveniente, mas depois refatoro.
  updatedAt?: Date; // Pra fins de checagem de inatividade.
}

// PARTICIPANT


export interface Participant {
  id: string;
  name: string;
  hasVoted: boolean; // Não precisava ter pois já existe Task.votes[participantName] = Vote. Depois refatoro.
}


// TASK

export type TaskStatus = 'waiting' | 'voting' | 'finished'; 
export type Vote = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '20'; // Valores possíveis para o voto
export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  status: TaskStatus;
  votes: {
    [participantName: string]: Vote;
  };
}