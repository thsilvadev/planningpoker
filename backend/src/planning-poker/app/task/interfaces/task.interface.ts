export type TaskStatus = 'waiting' | 'voting' | 'finished'; // Evitando erros
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
