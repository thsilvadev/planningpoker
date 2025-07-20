export type TaskStatus = 'waiting' | 'voting' | 'finished'; // Evitando erros

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  status: TaskStatus;
  votes: {
    [participantName: string]: string | number;
  };
}
