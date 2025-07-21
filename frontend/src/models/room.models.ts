export interface Room {
  id: string;
  name: string;
  participants: Participant[];
  currentTask?: Task;
  currentRound?: Round;
  createdBy: string;
}

export interface Participant {
  id: string;
  name: string;
  isOnline: boolean;
  isModerator: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

export interface Round {
  id: string;
  taskId: string;
  votes: Vote[];
  isActive: boolean;
  isRevealed: boolean;
  startedAt: Date;
  endedAt?: Date;
}

export interface Vote {
  participantId: string;
  participantName: string;
  value: string;
  submittedAt: Date;
}

export interface CreateRoomRequest {
  moderatorName: string;
}

export interface JoinRoomRequest {
  roomId: string;
  participantName: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
}

export interface SubmitVoteRequest {
  value: string;
}